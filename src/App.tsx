import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Droplets,
  ExternalLink,
  Info,
  Leaf,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  Settings2,
  Sprout,
  SunMedium,
  X,
} from "lucide-react";
import GardenScene, {
  gardenViews,
  type GardenViewId,
} from "./components/GardenScene";
import {
  buildComposition,
  compositionPlants,
  defaultPlanting,
  nativeFothergilla,
  resizePlanting,
  type ClusterSize,
  type PlantId,
  type PlantProfile,
} from "./data/plants";
import { dayPhase, dayToDate, plantState, seasonCopy } from "./lib/season";

const monthTicks = [
  { label: "Jan", day: 1 },
  { label: "Feb", day: 32 },
  { label: "Mar", day: 60 },
  { label: "Apr", day: 91 },
  { label: "May", day: 121 },
  { label: "Jun", day: 152 },
  { label: "Jul", day: 182 },
  { label: "Aug", day: 213 },
  { label: "Sep", day: 244 },
  { label: "Oct", day: 274 },
  { label: "Nov", day: 305 },
  { label: "Dec", day: 335 },
];

const seasonNarrative = (day: number, plantIds: PlantId[]) => {
  const present = new Set(plantIds);
  const has = (id: PlantId) => present.has(id);

  if (day < 95 || day > 334)
    return {
      eyebrow: "The quiet season",
      title: "Structure becomes color.",
      copy: [
        has("dogwood") && "Red dogwood stems carry the composition through winter.",
        has("hydrangea") && "Persistent hydrangea flower heads catch the low light.",
        has("fothergilla") && "Fothergilla reveals its compact branching silhouette.",
      ].filter(Boolean).join(" "),
    };
  if (day < 152)
    return {
      eyebrow: "The opening act",
      title: "Spring begins in layers.",
      copy: [
        has("fothergilla") && "Fothergilla flowers before its canopy fills in.",
        has("dogwood") && "Dogwood leafs out behind its small late-spring flowers.",
        has("hydrangea") && "Oakleaf hydrangea builds a broad green foundation.",
      ].filter(Boolean).join(" "),
    };
  if (day < 244)
    return {
      eyebrow: "The garden at full volume",
      title: "Summer holds the center.",
      copy: [
        has("hydrangea") && "Oakleaf hydrangea brings the main summer bloom.",
        has("dogwood") && "Dogwood adds an upright, finer-leaved layer.",
        has("fothergilla") && "Fothergilla settles into a rounded blue-green mass.",
      ].filter(Boolean).join(" "),
    };
  if (day < 315)
    return {
      eyebrow: "The second bloom",
      title: "Foliage becomes the flower.",
      copy: [
        has("fothergilla") && "Fothergilla turns gold, orange, and red.",
        has("hydrangea") && "Oakleaf hydrangea deepens toward mahogany.",
        has("dogwood") && "Dogwood thins to reveal the stems beneath.",
      ].filter(Boolean).join(" "),
    };
  return {
    eyebrow: "The reveal",
    title: "The framework returns.",
    copy: [
      has("dogwood") && "Leaf drop returns attention to the dogwood's red stems.",
      has("hydrangea") && "Hydrangea flower heads persist over bare branches.",
      has("fothergilla") && "Fothergilla recedes to a quiet low framework.",
    ].filter(Boolean).join(" "),
  };
};

function PlantRail({
  day,
  selectedId,
  onSelect,
  profiles,
  counts,
}: {
  day: number;
  selectedId: PlantId;
  onSelect: (id: PlantId) => void;
  profiles: PlantProfile[];
  counts: Record<PlantId, number>;
}) {
  return (
    <aside className="plant-rail" aria-label="Plants in this composition">
      <p className="rail-kicker">In this composition</p>
      <div className="plant-list">
        {profiles.map((plant, index) => {
          const state = plantState(plant, day);
          const active =
            state.bloom > 0.18 ||
            state.fruit > 0.18 ||
            state.fall > 0.2 ||
            (plant.id === "dogwood" && state.leaves < 0.1);
          return (
            <button
              key={plant.id}
              className={`plant-row ${selectedId === plant.id ? "is-selected" : ""}`}
              onClick={() => onSelect(plant.id)}
              aria-pressed={selectedId === plant.id}
            >
              <span className="plant-index">0{index + 1}</span>
              <span className="plant-row-copy">
                <span className="plant-name">
                  {plant.shortName}
                  {counts[plant.id] > 1 && <small> ×{counts[plant.id]}</small>}
                </span>
                <span className={active ? "plant-phase is-active" : "plant-phase"}>
                  {dayPhase(plant, day)}
                </span>
              </span>
              <span className="plant-swatch" style={{ background: plant.accent }} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function SelectedPlant({ plant, day }: { plant: PlantProfile; day: number }) {
  return (
    <section className="selected-plant" aria-live="polite">
      <div className="selected-plant-heading">
        <div>
          <p className="selected-role">{plant.role}</p>
          <h2>{plant.commonName}</h2>
          <p className="botanical-name">
            <em>{plant.botanicalName}</em> {plant.cultivar}
          </p>
        </div>
        <span className="phase-pill">{dayPhase(plant, day)}</span>
      </div>
      <div className="plant-facts">
        <span><Ruler size={14} />{plant.matureSize}</span>
        <span><SunMedium size={14} />{plant.light}</span>
        <span><Droplets size={14} />{plant.moisture}</span>
        <span><MapPin size={14} />{plant.zones}</span>
        <span><CalendarDays size={14} />{plant.bloomRange}</span>
        <span><Leaf size={14} />{plant.foliageBehavior}</span>
      </div>
      <a href={plant.sourceUrl} target="_blank" rel="noreferrer">
        Plant data: {plant.sourceLabel} <ExternalLink size={13} />
      </a>
    </section>
  );
}

function ConditionsPanel({
  nativeOnly,
  clusterCount,
  hasFothergilla,
  onNativeOnlyChange,
  onClose,
}: {
  nativeOnly: boolean;
  clusterCount: number;
  hasFothergilla: boolean;
  onNativeOnlyChange: (value: boolean) => void;
  onClose: () => void;
}) {
  return (
    <aside className="conditions-panel" aria-label="Composition conditions">
      <div className="conditions-heading">
        <div>
          <p>Composition brief</p>
          <h2>Part-shade border</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close conditions">
          <X size={18} />
        </button>
      </div>
      <div className="condition-score">
        <span className="score-orbit"><span>{clusterCount}/{clusterCount}</span></span>
        <div>
          <strong>Compatible composition</strong>
          <p>All {clusterCount} plants overlap on light, moisture, and hardiness.</p>
        </div>
      </div>
      <dl className="condition-list">
        <div><dt><MapPin size={15} /> Region</dt><dd>Chicago, IL · Zone 6a</dd></div>
        <div><dt><SunMedium size={15} /> Light</dt><dd>Morning sun / afternoon shade</dd></div>
        <div><dt><Droplets size={15} /> Moisture</dt><dd>Consistent, well-drained</dd></div>
        <div><dt><CalendarDays size={15} /> Intent</dt><dd>Four-season interest</dd></div>
      </dl>
      <div className="filter-preview">
        <p>Composition filter</p>
        <button
          className={nativeOnly && hasFothergilla ? "filter-toggle is-active" : "filter-toggle"}
          type="button"
          aria-pressed={nativeOnly && hasFothergilla}
          disabled={!hasFothergilla}
          onClick={() => onNativeOnlyChange(!nativeOnly)}
        >
          <span>
            <strong>Native species</strong>
            <small>
              {hasFothergilla
                ? "Use dwarf fothergilla for the spring role"
                : "Add fothergilla to make this swap available"}
            </small>
          </span>
          <span className="toggle-track" aria-hidden="true"><span /></span>
        </button>
      </div>
      <div className={nativeOnly && hasFothergilla ? "substitution-card is-applied" : "substitution-card"} aria-live="polite">
        <p>{nativeOnly && hasFothergilla ? "Swap applied" : "Available substitution"}</p>
        <div className="swap-route">
          <span>Mount Airy fothergilla</span>
          <ChevronRight size={14} />
          <strong>Dwarf fothergilla</strong>
        </div>
        <p className="swap-explanation">
          Keeps the spring bottlebrush bloom and fall-color role while fitting the
          same Zone 6a, part-shade, moist and well-drained conditions.
        </p>
        <div className="swap-facts">
          <span>{nativeFothergilla.zones}</span>
          <span>Blooms April–May</span>
          <span>{nativeFothergilla.matureSize}</span>
        </div>
        <a href={nativeFothergilla.sourceUrl} target="_blank" rel="noreferrer">
          Source: {nativeFothergilla.sourceLabel} <ExternalLink size={12} />
        </a>
      </div>
      <p className="conditions-note">
        Seasonal timing is a representative range, not a weather forecast.
      </p>
    </aside>
  );
}

function CompositionPanel({
  planting,
  profiles,
  onSizeChange,
  onPlantChange,
  onReset,
  onClose,
}: {
  planting: PlantId[];
  profiles: PlantProfile[];
  onSizeChange: (size: ClusterSize) => void;
  onPlantChange: (index: number, plantId: PlantId) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const sizes: { value: ClusterSize; label: string }[] = [
    { value: 3, label: "Focused" },
    { value: 5, label: "Layered" },
    { value: 7, label: "Full" },
  ];

  return (
    <aside className="composition-panel" aria-label="Edit planting composition">
      <div className="conditions-heading">
        <div>
          <p>Composition editor</p>
          <h2>Shape the cluster</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close composition editor">
          <X size={18} />
        </button>
      </div>

      <p className="composition-intro">
        Change the number of plants, then choose the species at each position. The
        garden stays arranged in natural layers as the cluster grows.
      </p>

      <fieldset className="cluster-size-control">
        <legend>Cluster size</legend>
        <div className="size-options">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              className={planting.length === size.value ? "is-active" : ""}
              aria-pressed={planting.length === size.value}
              onClick={() => onSizeChange(size.value)}
            >
              <strong>{size.value}</strong>
              <span>{size.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="planting-choices">
        <div className="planting-choices-heading">
          <div>
            <strong>Plants in this cluster</strong>
            <span>{new Set(planting).size} species · {planting.length} plants</span>
          </div>
          <button type="button" onClick={onReset}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
        <div className="planting-slot-list">
          {planting.map((plantId, index) => (
            <label className="planting-slot" key={`slot-${index + 1}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <select
                value={plantId}
                onChange={(event) => onPlantChange(index, event.currentTarget.value as PlantId)}
                aria-label={`Plant ${index + 1}`}
              >
                {profiles.map((profile) => (
                  <option value={profile.id} key={profile.id}>
                    {profile.commonName}
                  </option>
                ))}
              </select>
              <span
                className="choice-swatch"
                style={{ background: profiles.find((profile) => profile.id === plantId)?.accent }}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
      </div>

      <p className="composition-note">
        These plants share the proof’s Zone 6a, part-shade, consistently moist site.
        Mature spacing still needs to be confirmed for the real planting bed.
      </p>
    </aside>
  );
}

function Timeline({
  day,
  playing,
  onDayChange,
  onTogglePlay,
}: {
  day: number;
  playing: boolean;
  onDayChange: (day: number) => void;
  onTogglePlay: () => void;
}) {
  const date = dayToDate(day);
  const season = seasonCopy(day);
  return (
    <section className="timeline-shell" aria-label="Year timeline">
      <div className="timeline-date">
        <span className="date-day">{date.day}</span>
        <span>
          <strong>{date.month}</strong>
          <small>Representative year</small>
        </span>
      </div>
      <button
        className="play-button"
        onClick={onTogglePlay}
        aria-label={playing ? "Pause the year" : "Play the year"}
      >
        {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      </button>
      <div className="timeline-control">
        <div className="timeline-context">
          <strong>{season.name}</strong>
          <span>{season.note}</span>
        </div>
        <div className="range-wrap">
          <input
            type="range"
            min="1"
            max="365"
            step="1"
            value={day}
            onChange={(event) => onDayChange(Number(event.currentTarget.value))}
            onKeyDown={(event) => {
              const nextByKey: Partial<Record<string, number>> = {
                Home: 1,
                End: 365,
                ArrowLeft: Math.max(1, day - 1),
                ArrowDown: Math.max(1, day - 1),
                ArrowRight: Math.min(365, day + 1),
                ArrowUp: Math.min(365, day + 1),
                PageDown: Math.max(1, day - 7),
                PageUp: Math.min(365, day + 7),
              };
              const nextDay = nextByKey[event.key];
              if (nextDay === undefined) return;
              event.preventDefault();
              onDayChange(nextDay);
            }}
            aria-label="Day of year"
            aria-valuetext={date.label}
            style={{ "--range-progress": `${((day - 1) / 364) * 100}%` } as React.CSSProperties}
          />
          <div className="month-ticks" aria-hidden="true">
            {monthTicks.map((tick) => (
              <button
                key={tick.label}
                type="button"
                tabIndex={-1}
                onClick={() => onDayChange(tick.day)}
                className={date.shortMonth === tick.label ? "is-current" : ""}
              >
                {tick.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [day, setDay] = useState(172);
  const [selectedId, setSelectedId] = useState<PlantId>("hydrangea");
  const [planting, setPlanting] = useState<PlantId[]>(() => [...defaultPlanting]);
  const [playing, setPlaying] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [compositionOpen, setCompositionOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [nativeOnly, setNativeOnly] = useState(false);
  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    [],
  );
  const availableProfiles = useMemo(() => compositionPlants(nativeOnly), [nativeOnly]);
  const activePlants = useMemo(() => {
    const activeIds = new Set(planting);
    return availableProfiles.filter((plant) => activeIds.has(plant.id));
  }, [availableProfiles, planting]);
  const plantCounts = useMemo(
    () => planting.reduce<Record<PlantId, number>>(
      (counts, plantId) => ({ ...counts, [plantId]: counts[plantId] + 1 }),
      { fothergilla: 0, hydrangea: 0, dogwood: 0 },
    ),
    [planting],
  );
  const instances = useMemo(
    () => buildComposition(planting, nativeOnly),
    [nativeOnly, planting],
  );
  const narrative = seasonNarrative(day, planting);
  const selectedPlant = activePlants.find((plant) => plant.id === selectedId) ?? activePlants[0];

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setDay((current) => (current >= 365 ? 1 : current + 1));
    }, 42);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConditionsOpen(false);
        setCompositionOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!activePlants.some((plant) => plant.id === selectedId)) {
      setSelectedId(activePlants[0].id);
    }
  }, [activePlants, selectedId]);

  const changeClusterSize = (size: ClusterSize) => {
    setPlanting((current) => resizePlanting(current, size));
  };

  const changePlant = (index: number, plantId: PlantId) => {
    setPlanting((current) =>
      current.map((currentPlant, currentIndex) =>
        currentIndex === index ? plantId : currentPlant,
      ),
    );
    setSelectedId(plantId);
  };

  return (
    <main className="experience-shell">
      <a href="#year-timeline" className="skip-link">Skip to year timeline</a>
      <section className="scene-gallery" aria-label="Four seasonal garden views">
        {gardenViews.map((view, index) => (
          <article
            key={view.id}
            className={index === 0 ? "scene-frame is-primary" : "scene-frame"}
            aria-label={view.label}
          >
            <div className="scene-layer">
              <GardenScene
                day={day}
                selectedId={selectedId}
                onSelect={setSelectedId}
                reducedMotion={reducedMotion || index > 0}
                instances={instances}
                viewId={view.id as GardenViewId}
                primary={index === 0}
              />
            </div>
            <div className="atmosphere" aria-hidden="true" />
            <div className="photo-stamp" aria-hidden="true">
              <span>{view.number} / 04</span>
              <strong>{view.label}</strong>
            </div>
          </article>
        ))}
      </section>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Garden Through Time home">
          <span className="brand-mark"><span /></span>
          <span>Garden<br />Through Time</span>
        </a>
        <div className="topbar-actions">
          <span className="region-label"><MapPin size={14} />Chicago · Zone 6a</span>
          <button
            className="composition-button"
            onClick={() => {
              setConditionsOpen(false);
              setCompositionOpen(true);
            }}
          >
            <Sprout size={16} /> Edit planting
          </button>
          <button
            className="conditions-button"
            onClick={() => {
              setCompositionOpen(false);
              setConditionsOpen(true);
            }}
          >
            <Settings2 size={16} /> Conditions
          </button>
        </div>
      </header>

      <section className="story-panel" aria-live="polite">
        <p>{narrative.eyebrow}</p>
        <h1>{narrative.title}</h1>
        <div className="story-rule" />
        <p className="story-copy">{narrative.copy}</p>
      </section>

      <PlantRail
        day={day}
        selectedId={selectedId}
        onSelect={setSelectedId}
        profiles={activePlants}
        counts={plantCounts}
      />

      <button
        className="info-toggle"
        onClick={() => setDetailsOpen((open) => !open)}
        aria-expanded={detailsOpen}
        aria-controls="selected-plant-details"
      >
        <Info size={16} /> Plant details <ChevronRight size={15} />
      </button>
      <div id="selected-plant-details" className={detailsOpen ? "detail-wrap is-open" : "detail-wrap"}>
        <SelectedPlant plant={selectedPlant} day={day} />
      </div>

      <div id="year-timeline">
        <Timeline
          day={day}
          playing={playing}
          onDayChange={(nextDay) => {
            setPlaying(false);
            setDay(nextDay);
          }}
          onTogglePlay={() => setPlaying((value) => !value)}
        />
      </div>

      {conditionsOpen && (
        <>
          <button
            className="panel-scrim"
            aria-label="Close conditions"
            onClick={() => setConditionsOpen(false)}
          />
          <ConditionsPanel
            nativeOnly={nativeOnly}
            clusterCount={planting.length}
            hasFothergilla={plantCounts.fothergilla > 0}
            onNativeOnlyChange={setNativeOnly}
            onClose={() => setConditionsOpen(false)}
          />
        </>
      )}

      {compositionOpen && (
        <>
          <button
            className="panel-scrim"
            aria-label="Close composition editor"
            onClick={() => setCompositionOpen(false)}
          />
          <CompositionPanel
            planting={planting}
            profiles={availableProfiles}
            onSizeChange={changeClusterSize}
            onPlantChange={changePlant}
            onReset={() => {
              setPlanting([...defaultPlanting]);
              setSelectedId("hydrangea");
            }}
            onClose={() => setCompositionOpen(false)}
          />
        </>
      )}
    </main>
  );
}
