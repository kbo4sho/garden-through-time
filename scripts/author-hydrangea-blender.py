"""Original oakleaf organ + Cycles PBR bake. Run with Blender --background --python.
No photographs, downloaded meshes, or baked studio illumination are used.
The lightweight organ is assembled into the seasonal plant by the Node generator.
"""
import bpy
import math
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'authoring' / 'hydrangea'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.seed = 41
bpy.context.preferences.filepaths.save_version = 0
scene.cycles.bake_type = 'NORMAL'
scene.render.bake.margin = 12
scene.render.bake.use_selected_to_active = True
scene.render.bake.cage_extrusion = .08
scene.render.bake.max_ray_distance = .16
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'Standard'

# Three pairs of uneven, softly shouldered lobes plus the terminal lobe.
# Values describe half width / leaf length; cubic interpolation keeps shoulders supple.
outline = [(0,.012),(.05,.12),(.16,.265),(.235,.305),(.305,.205),(.365,.30),
           (.435,.445),(.50,.425),(.575,.225),(.625,.255),(.69,.315),
           (.75,.285),(.815,.165),(.865,.15),(.945,.065),(1,0)]
def width(t):
    k = next((i for i in range(len(outline)-1) if t <= outline[i+1][0]), len(outline)-2)
    a,b = outline[k], outline[k+1]
    prev,nxt = outline[max(0,k-1)],outline[min(len(outline)-1,k+2)]
    u=(t-a[0])/(b[0]-a[0]); d=b[0]-a[0]
    m0=(b[1]-prev[1])/max(.001,b[0]-prev[0]);m1=(nxt[1]-a[1])/max(.001,nxt[0]-a[0])
    return max(0,(2*u**3-3*u*u+1)*a[1]+(u**3-2*u*u+u)*m0*d+(-2*u**3+3*u*u)*b[1]+(u**3-u*u)*m1*d)

# Veins follow curved paths from the midrib to individual lobes.
veins=[]
for side in [-1,1]:
    for start,tip,w in [(.08,.235,.305),(.265,.455,.44),(.465,.70,.31),(.67,.865,.15)]:
        last=(0,start)
        for j in range(1,9):
            u=j/8; p=(side*w*u, start+(tip-start)*(u*.7+.3*u*u))
            veins.append((last,p,.007*(1-.7*u)))
            if j in [3,5,7]:
                end=(p[0]+side*.047, min(.98,p[1]+.08))
                veins.append((p,end,.0022))
            last=p

def segment_distance(x,y,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1]
    u=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))
    return math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)

def vein_height(x,t):
    h=.0032*(1-.75*t)*math.exp(-abs(x)/(.009*(1-.65*t)))
    for a,b,w in veins:
        h+=.0018*(w/.007)*math.exp(-(segment_distance(x,t,a,b)/w)**2)
    return h

def point(t,s,detail=False):
    w=width(t)
    # Small margin teeth modulate only the contour, not the whole surface.
    edge=1 + .012*math.sin(t*math.pi*74)*math.sin(math.pi*t)
    x=s*w*(edge if detail else 1)
    x += .017*t*t
    # Curvature uses physical cross-leaf distance. It cannot pinch at lobe sinuses.
    z=.105*math.sin(math.pi*t)-.23*t*t*t-.42*x*x+.15*x*math.sin(t*math.pi)+.025*x*math.sin(t*math.pi*5)
    if detail:
        z+=vein_height(x-.017*t*t,t)
        z+=.0012*math.sin(x*89+t*21)*math.sin(t*93)*math.sin(math.pi*t)
    return x,t,z

def leaf(name,rows,cols,detail):
    verts=[point(i/rows,2*j/(cols-1)-1,detail) for i in range(rows+1) for j in range(cols)]
    faces=[]
    for i in range(rows):
        for j in range(cols-1):
            a=i*cols+j;faces.append((a,a+1,a+cols+1,a+cols))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    if detail:
        pigment=mesh.attributes.new('vascular pigment','FLOAT','POINT')
        for i,p in enumerate(verts):
            pigment.data[i].value=min(1,vein_height(p[0]-.017*p[1]*p[1],p[1])/.0025)
    uv=mesh.uv_layers.new(name='Blade coordinates')
    for polygon in mesh.polygons:
        polygon.use_smooth=True
        for loop_index in polygon.loop_indices:
            p=mesh.vertices[mesh.loops[loop_index].vertex_index].co
            uv.data[loop_index].uv=(.5+p.x/.98,.02+p.y*.96)
    obj=bpy.data.objects.new(name,mesh);scene.collection.objects.link(obj)
    return obj

low=leaf('Oakleaf delivery organ',36,5,False)
high=leaf('Oakleaf detailed source',256,129,True)
mat=bpy.data.materials.new('Original leaf tissue');mat.use_nodes=True
nodes=mat.node_tree.nodes;links=mat.node_tree.links
bsdf=nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.72
uv=nodes.new('ShaderNodeTexCoord')
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=34;noise.inputs['Detail'].default_value=4;noise.inputs['Roughness'].default_value=.72
links.new(uv.outputs['UV'],noise.inputs['Vector'])
color=nodes.new('ShaderNodeValToRGB')
color.color_ramp.elements[0].position=.1;color.color_ramp.elements[0].color=(.67,.72,.61,1)
color.color_ramp.elements[1].position=.85;color.color_ramp.elements[1].color=(.91,.94,.84,1)
links.new(noise.outputs['Fac'],color.inputs['Fac'])
vascular=nodes.new('ShaderNodeAttribute');vascular.attribute_name='vascular pigment'
vein_color=nodes.new('ShaderNodeMixRGB');vein_color.blend_type='MIX'
vein_color.inputs[2].default_value=(.95,.98,.78,1)
links.new(vascular.outputs['Fac'],vein_color.inputs[0]);links.new(color.outputs['Color'],vein_color.inputs[1])
links.new(vein_color.outputs['Color'],bsdf.inputs['Base Color'])
fine=nodes.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=240;fine.inputs['Detail'].default_value=2
links.new(uv.outputs['UV'],fine.inputs['Vector'])
bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.22;bump.inputs['Distance'].default_value=.0012
links.new(fine.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
rough=nodes.new('ShaderNodeMapRange');rough.inputs['From Min'].default_value=0;rough.inputs['From Max'].default_value=1
rough.inputs['To Min'].default_value=.58;rough.inputs['To Max'].default_value=.84
links.new(noise.outputs['Fac'],rough.inputs['Value']);links.new(rough.outputs['Result'],bsdf.inputs['Roughness'])
high.data.materials.append(mat)
target=bpy.data.materials.new('Delivery baked leaf');target.use_nodes=True;low.data.materials.append(target)
image_node=target.node_tree.nodes.new('ShaderNodeTexImage');target.node_tree.nodes.active=image_node
bpy.ops.object.select_all(action='DESELECT');high.select_set(True);low.select_set(True);bpy.context.view_layer.objects.active=low

for name,kind,size in [('normal','NORMAL',512),('albedo','DIFFUSE',256),('roughness','ROUGHNESS',128)]:
    img=bpy.data.images.new('hydrangea-'+name,width=size,height=size,alpha=False)
    img.colorspace_settings.name='sRGB' if name=='albedo' else 'Non-Color'
    img.generated_color = (.5,.5,1,1) if name=='normal' else (.84,.87,.78,1) if name=='albedo' else (.72,.72,.72,1)
    scene.render.bake.use_clear=False
    image_node.image=img
    if kind=='DIFFUSE':
        scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True
    bpy.ops.object.bake(type=kind)
    img.filepath_raw=str(OUT/(name+'.png'));img.file_format='PNG';img.save()
    print('BAKED',name,flush=True)

# Keep an inspectable source file, with the high-detail source hidden initially.
high.hide_render=True;high.hide_set(True)
bsdf=target.node_tree.nodes.get('Principled BSDF')
for slot,name in [('Base Color','albedo'),('Roughness','roughness')]:
    n=target.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images['hydrangea-'+name]
    target.node_tree.links.new(n.outputs['Color'],bsdf.inputs[slot])
n=target.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images['hydrangea-normal']
normal=target.node_tree.nodes.new('ShaderNodeNormalMap');target.node_tree.links.new(n.outputs['Color'],normal.inputs['Color']);target.node_tree.links.new(normal.outputs['Normal'],bsdf.inputs['Normal'])
for img in bpy.data.images:
    if img.name.startswith('hydrangea-'):img.pack()
bpy.ops.object.select_all(action='DESELECT');low.select_set(True);bpy.context.view_layer.objects.active=low
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hydrangea-leaf.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'hydrangea-leaf.glb'),use_selection=True,export_format='GLB',export_yup=False)
(OUT/'provenance.json').write_text(json.dumps({'authoring':'Original project geometry and procedural tissue; no third-party images or meshes','blender':bpy.app.version_string,'generator':'scripts/author-hydrangea-blender.py','bake':'Cycles selected-to-active tangent normal, color-only diffuse, roughness; no illumination baked','low_vertices':len(low.data.vertices),'high_vertices':len(high.data.vertices)},indent=2)+'\n')
print('AUTHORING_COMPLETE',flush=True)
