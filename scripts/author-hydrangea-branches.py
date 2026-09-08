"""Build an original oakleaf branch study and shrub in Blender.

Explicitly authored control points and leaf poses define three branch forms.
No purchased assets or photographs are embedded. Run after the leaf bake.
"""
import bpy
import math
import json
import random
from pathlib import Path
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parents[1] / 'authoring' / 'hydrangea'
bpy.ops.wm.open_mainfile(filepath=str(OUT / 'hydrangea-leaf.blend'))
bpy.context.preferences.filepaths.save_version = 0
blade = bpy.data.objects['Oakleaf delivery organ'].data.copy()
leaf_material = bpy.data.materials['Delivery baked leaf']
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
scene = bpy.context.scene
rng = random.Random(208)
wood = bpy.data.materials.new('Oakleaf warm exfoliating wood')
wood.diffuse_color = (.19, .11, .065, 1)
wood.use_nodes = True
wood.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = wood.diffuse_color
wood.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .94

def empty(name, parent=None, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    return obj

def point_at(points, t):
    u = max(0, min(.999999, t)) * (len(points) - 1)
    k = int(u); f = u - k
    a, b, c, d = [Vector(points[max(0, min(len(points)-1, j))]) for j in [k-1, k, k+1, k+2]]
    return .5 * ((2*b) + (-a+c)*f + (2*a-5*b+4*c-d)*f*f + (-a+3*b-3*c+d)*f*f*f)

def stem(name, controls, radius, parent, layer='branches', phase=0):
    count = (len(controls)-1)*5
    points = [point_at(controls, i/count) for i in range(count+1)]
    vertices, faces = [], []
    sides = 6 if radius > .012 else 4
    for i, p in enumerate(points):
        tangent = (points[min(i+1,count)] - points[max(0,i-1)]).normalized()
        across = tangent.cross(Vector((1,0,0)))
        if across.length < .01: across = tangent.cross(Vector((0,1,0)))
        across.normalize(); other = tangent.cross(across).normalized()
        r = radius * (1 - .72*i/count)
        for j in range(sides):
            angle = j/sides*math.tau
            vertices.append(p+r*(across*math.cos(angle)+other*math.sin(angle)))
            if i < count:
                a=i*sides+j; b=i*sides+(j+1)%sides
                faces.append((a,b,b+sides,a+sides))
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(vertices, [], faces); mesh.update()
    # Petioles share the leaf layer so the connection grows and drops with its blade.
    if layer == 'leaves':
        uv = mesh.uv_layers.new(name='Blade coordinates')
        for loop in uv.data: loop.uv = (.02, .02)
    for polygon in mesh.polygons: polygon.use_smooth = True
    obj = bpy.data.objects.new(name, mesh); scene.collection.objects.link(obj); obj.parent = parent
    obj['layer'] = layer; obj['phase'] = phase
    obj['tint'] = [.82,.87,.71] if layer == 'leaves' else [.20,.105,.058]
    mesh.materials.append(leaf_material if layer == 'leaves' else wood)
    return obj

def leaf_pair(parent, points, t, azimuth, length, inclination, roll, label):
    at = point_at(points, t)
    for side in range(2):
        phase = rng.random()
        anchor = empty(label+' attachment '+str(side), parent, at)
        anchor['organAnchor'] = True
        angle = math.radians(azimuth + side*180 + rng.uniform(-16,16))
        pitch = math.radians(inclination + rng.uniform(-19,23))
        along = Vector((math.cos(angle)*math.cos(pitch), math.sin(angle)*math.cos(pitch), math.sin(pitch)))
        across = Vector((math.sin(angle), -math.cos(angle), 0))
        normal = across.cross(along).normalized()
        petiole_length = rng.uniform(.048,.083)
        end = along*petiole_length + Vector((0,0,.014))
        stem(label+' petiole '+str(side), [(0,0,0), end*.52+Vector((0,0,.009)), end], .0032, anchor, 'leaves', phase)
        mesh = blade.copy()
        # Bend the midrib in physical space: tips turn away from the basal plane.
        # Independent cross-blade cupping and longitudinal twist give exposed
        # lobes different normals, without folding at the outline's sinuses.
        bend = rng.uniform(.48,1.27)
        cup = rng.uniform(-.80,.75)
        twist = rng.uniform(-.65,.65)
        rise = rng.uniform(.045,.14)
        width = rng.uniform(.74,1.05)
        for vertex in mesh.vertices:
            x,t,_ = vertex.co
            x *= width
            y = math.sin(bend*t)/bend
            midrib = (math.cos(bend*t)-1)/bend + rise*math.sin(math.pi*t)
            cross_z = cup*x*x + .045*x*math.sin(t*17+side)
            angle_t = twist*math.sin(t*math.pi*.85)
            vertex.co = (x*math.cos(angle_t)-cross_z*math.sin(angle_t), y,
                         midrib+x*math.sin(angle_t)+cross_z*math.cos(angle_t))
        mesh.update()
        obj = bpy.data.objects.new(label+' blade '+str(side), mesh)
        scene.collection.objects.link(obj); obj.parent = anchor
        basis = Matrix((across,along,normal)).transposed().to_4x4()
        basis = basis @ Matrix.Rotation(math.radians(roll*(1 if side else -.72)),4,'Y')
        basis.translation = end
        obj.matrix_local = basis
        obj.scale = (length*rng.uniform(.82,1.09),)*3
        obj['layer'] = 'leaves'; obj['phase'] = phase
        brightness = rng.uniform(.83,1)
        obj['tint'] = [brightness*.92,brightness*.98,brightness*.82]

# Uneven internodes and decussate pairs; each form has a different growth history.
FORMS = {
 'upright': {
  'path': [(0,0,0),(.04,.23,.15),(-.025,.49,.31),(.09,.77,.43),(.13,1.00,.42)],
  'nodes': [(.14,15,.29,18,11),(.31,112,.28,6,-14),(.53,27,.265,12,17),(.72,125,.23,22,-9),(.9,41,.18,29,12)],
  'side': [(.44,[(-.16,.11,.03),(-.36,.26,.11),(-.43,.40,.12)],[(.32,165,.235,-4,18),(.76,72,.21,9,-13)]),
           (.68,[(.13,.10,.01),(.28,.23,.045)],[(.4,7,.23,-12,21),(.85,99,.19,3,-17)])]},
 'arching': {
  'path': [(0,0,0),(-.055,.24,.12),(-.12,.49,.19),(-.18,.75,.10),(-.14,.97,-.055)],
  'nodes': [(.16,35,.29,4,15),(.34,133,.32,-8,-18),(.57,54,.28,-17,11),(.8,151,.25,-26,-16),(.94,68,.19,-9,9)],
  'side': [(.39,[(.12,.10,.055),(.34,.27,.07),(.41,.44,-.04)],[(.27,14,.25,-10,12),(.71,110,.24,-22,-13)]),
           (.65,[(-.15,.10,-.02),(-.3,.24,-.13)],[(.64,154,.22,-32,16)])]},
 'forked': {
  'path': [(0,0,0),(.045,.20,.11),(.025,.44,.27),(-.04,.67,.34),(-.08,.85,.31)],
  'nodes': [(.16,77,.255,18,13),(.39,173,.28,-3,-15),(.65,88,.225,9,18),(.87,190,.18,17,-11)],
  'side': [(.43,[(.17,.11,.065),(.32,.3,.16),(.35,.49,.18)],[(.23,5,.25,9,12),(.57,103,.235,2,-21),(.85,13,.17,20,9)]),
           (.67,[(-.14,.1,.01),(-.31,.26,-.06)],[(.32,153,.24,-8,17),(.82,62,.18,-16,-12)])]},
}

def branch(form, parent, name, flowering):
    spec = FORMS[form]
    obj = empty(name, parent); obj['branchForm'] = form
    path = spec['path']; stem(name+' main wood',path,.011,obj)
    for i,node in enumerate(spec['nodes']): leaf_pair(obj,path,*node,name+' node '+str(i))
    for k,(at,offsets,nodes) in enumerate(spec['side']):
        root = point_at(path,at)
        sidepath = [root]+[root+Vector(p) for p in offsets]
        stem(name+' lateral '+str(k),sidepath,.0055,obj)
        for i,node in enumerate(nodes): leaf_pair(obj,sidepath,*node,name+' lateral '+str(k)+' node '+str(i))
    if flowering:
        tip = empty(name+' flower attachment',obj,path[-1]); tip['flowerTerminal']=True
    return obj

plant = empty('Oakleaf authored canopy')
# Each woody scaffold has its own bend and three unequally spaced branch junctions.
SCAFFOLDS = [
 [(-.10,.02,0),(-.27,.08,.40),(-.43,.17,.83),(-.50,.23,1.27)],
 [(.04,.08,0),(.18,.22,.45),(.22,.40,.96),(.34,.47,1.52)],
 [(.10,-.03,0),(.29,-.13,.37),(.45,-.19,.78),(.61,-.14,1.23)],
 [(-.02,-.11,0),(-.15,-.28,.34),(-.23,-.41,.74),(-.18,-.57,1.03)],
 [(-.12,.10,0),(-.32,.29,.39),(-.52,.40,.86),(-.68,.41,1.18)],
 [(.10,.02,0),(.11,.17,.55),(-.045,.23,1.12),(-.04,.32,1.58)],
 [(.06,-.10,0),(.22,-.31,.29),(.39,-.48,.62),(.41,-.58,.91)],
]
# Form, attachment fraction, compass heading, scale, flowering.
POSES = [
 [('arching',.43,106,.83,False),('forked',.72,61,.92,False),('upright',1,79,.95,True)],
 [('forked',.42,-25,.78,False),('arching',.76,-46,.88,True),('upright',1,-8,.88,True)],
 [('arching',.43,-106,.91,False),('forked',.75,-63,.95,True),('upright',1,-86,.87,True)],
 [('forked',.46,169,.78,False),('arching',.79,141,.98,True),('upright',1,183,.82,True)],
 [('arching',.51,43,.83,False),('forked',.8,8,.90,True),('upright',1,47,.85,True)],
 [('forked',.40,30,.76,False),('arching',.76,98,.87,False),('upright',1,-52,.81,True)],
 [('arching',.50,-151,.86,False),('forked',.78,-119,.88,False),('upright',1,-144,.83,True)],
]
# Growth directions are authored in elevation as well as compass heading.
# Rows match the five possible junctions: low, middle, terminal, interior, young.
ELEVATIONS = [
 [(14,-17),(27,12),(32,-11),(43,18),(-9,-21)],
 [(-2,12),(18,-16),(24,14),(37,-20),(8,17)],
 [(10,-9),(-8,21),(35,-13),(48,11)],
 [(22,6),(31,-17),(17,19),(29,-24)],
 [(-5,-15),(23,18),(12,-8),(51,16),(16,-19)],
 [(4,18),(-13,-12),(30,9),(34,-18),(-6,24)],
 [(19,-6),(26,16),(25,-17),(42,13)],
]
for i,(path,poses) in enumerate(zip(SCAFFOLDS,POSES)):
    stem('Persistent stem '+str(i),path,.019,plant)
    form,_,heading,scale,flowering=poses[0]
    poses=[(form,[.20,.28,.23,.31,.18,.26,.22][i],heading,scale,flowering)]+poses[1:]
    # Interior return shoots connect the outer sprays into a canopy volume.
    # These are distinct junctions on the same wood, with their own internodes.
    poses=poses+[('forked',[.49,.57,.64,.52,.43,.71,.47][i],poses[-1][2]+163,.70,False)]
    if i in [0,1,4,5]: poses=poses+[('upright',.87,poses[-1][2]-72,.66,True)]
    for j,(form,t,heading,scale,flowering) in enumerate(poses):
        obj=branch(form,plant,f'Stem {i} branch {j} {form}',flowering)
        obj.location=point_at(path,t)
        pitch,roll=ELEVATIONS[i][j]
        obj.rotation_euler=[math.radians(pitch),math.radians(roll),math.radians(heading)]
        obj.scale=(scale,scale,scale)

# A separate, editable branch study is retained in the source but not delivered.
study=empty('Three branch forms — authoring study',location=(4,0,0))
for i,form in enumerate(FORMS):
    obj=branch(form,study,'Study '+form,False);obj.location=(i*1.5,0,0)
study.hide_render=True
bpy.context.view_layer.update()
def descendants(obj):
    yield obj
    for child in obj.children: yield from descendants(child)
bpy.ops.object.select_all(action='DESELECT')
for obj in descendants(plant): obj.select_set(True)
bpy.context.view_layer.objects.active=plant
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hydrangea-branches.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'hydrangea-branches.glb'),use_selection=True,
    export_format='GLB',export_yup=True,export_extras=True)
(OUT/'branch-provenance.json').write_text(json.dumps({
 'authoring':'Original explicitly authored branch control points, opposite leaf pairs, connected petioles and curated scaffold poses; no third-party content',
 'generator':'scripts/author-hydrangea-branches.py','blender':bpy.app.version_string,
 'forms':list(FORMS),'persistent_stems':len(SCAFFOLDS),'branch_instances':sum(bool(o.get('branchForm')) for o in descendants(plant)),
 'blades':sum(' blade ' in o.name for o in descendants(plant)),
 'flower_attachments':sum(bool(o.get('flowerTerminal')) for o in descendants(plant)),
 'botanical_reference':'https://plants.ces.ncsu.edu/plants/hydrangea-quercifolia/'
},indent=2)+'\n')
print('BRANCH_AUTHORING_COMPLETE',flush=True)
