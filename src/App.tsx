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
  Rotate3D,
  Ruler,
  Settings2,
  SunMedium,
  X,
} from "lucide-react";
import GardenScene from "./components/GardenScene";
import {
  compositionPlants,
  nativeFothergilla,
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

const seasonNarrative = (day: number) => {
  if (day < 95 || day > 334)
    return {
      eyebrow: "The quiet season",
      title: "Structure becomes color.",
      copy: "Red dogwood stems hold the composition while hydrangea flower heads and branching silhouettes catch the low winter light.",
    };
  if (day < 152)
    return {
      eyebrow: "The opening act",
      title: "Spring begins in layers.",
      copy: "Fothergilla flowers before its canopy fills in. The other shrubs stay quieter, giving the first bloom room to register.",
    };
  if (day < 244)
    return {
      eyebrow: "The garden at full volume",
      title: "Summer holds the center.",
      copy: "Oakleaf hydrangea takes over from spring bloom while three distinct leaf shapes keep the green composition legible.",
    };
  if (day < 315)
    return {
      eyebrow: "The second bloom",
      title: "Foliage becomes the flower.",
      copy: "Golden fothergilla, dark-mahogany hydrangea, and thinning dogwood reveal a staggered fall handoff.",
    };
  return {
    eyebrow: "The reveal",
    title: "The framework returns.",
    copy: "Leaf drop exposes the architecture beneath the summer mass and returns attention to bark, stems, and persistent flowers.",
  };
};

function PlantRail({
  day,
  selectedId,
  onSelect,
  profiles,
}: {
  day: number;
  selectedId: PlantId;
  onSelect: (id: PlantId) => void;
  profiles: PlantProfile[];
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
                <span className="plant-name">{plant.shortName}</span>
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
  onNativeOnlyChange,
  onClose,
}: {
  nativeOnly: boolean;
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
        <span className="score-orbit"><span>3/3</span></span>
        <div>
          <strong>Compatible composition</strong>
          <p>All three plants overlap on light, moisture, and hardiness.</p>
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
          className={nativeOnly ? "filter-toggle is-active" : "filter-toggle"}
          type="button"
          aria-pressed={nativeOnly}
          onClick={() => onNativeOnlyChange(!nativeOnly)}
        >
          <span>
            <strong>Native species</strong>
            <small>Prefer a native plant for each design role</small>
          </span>
          <span className="toggle-track" aria-hidden="true"><span /></span>
        </button>
      </div>
      <div className={nativeOnly ? "substitution-card is-applied" : "substitution-card"} aria-live="polite">
        <p>{nativeOnly ? "Swap applied" : "Available substitution"}</p>
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
  const [playing, setPlaying] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [nativeOnly, setNativeOnly] = useState(false);
  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    [],
  );
  const narrative = seasonNarrative(day);
  const activePlants = useMemo(() => compositionPlants(nativeOnly), [nativeOnly]);
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
      if (event.key === "Escape") setConditionsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="experience-shell">
      <a href="#year-timeline" className="skip-link">Skip to year timeline</a>
      <div className="scene-layer" aria-label="Interactive 3D shrub composition">
        <GardenScene
          day={day}
          selectedId={selectedId}
          onSelect={setSelectedId}
          reducedMotion={reducedMotion}
          profiles={activePlants}
        />
      </div>
      <div className="atmosphere" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Garden Through Time home">
          <span className="brand-mark"><span /></span>
          <span>Garden<br />Through Time</span>
        </a>
        <div className="topbar-actions">
          <span className="region-label"><MapPin size={14} />Chicago · Zone 6a</span>
          <button className="conditions-button" onClick={() => setConditionsOpen(true)}>
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

      <div className="orbit-hint" aria-hidden="true">
        <Rotate3D size={16} /> Drag to look around
      </div>

      <PlantRail
        day={day}
        selectedId={selectedId}
        onSelect={setSelectedId}
        profiles={activePlants}
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
            onNativeOnlyChange={setNativeOnly}
            onClose={() => setConditionsOpen(false)}
          />
        </>
      )}
    </main>
  );
}
