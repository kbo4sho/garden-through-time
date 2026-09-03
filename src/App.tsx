import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Droplets,
  ExternalLink,
  Info,
  Leaf,
  Link2,
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
  type VisualStyle,
} from "./components/GardenScene";
import {
  buildComposition,
  compositionTemplates,
  compositionPlants,
  defaultTemplateId,
  nativeFothergilla,
  plantGroups,
  plants,
  previewTemplateForSize,
  seasonalEvidenceFor,
  templateIsAvailable,
  templatesForSize,
  type ClusterSize,
  type CompositionTemplate,
  type LibraryAccess,
  type PlantGroup,
  type PlantId,
  type PlantProfile,
} from "./data/plants";
import { dayPhase, dayToDate, plantState, seasonCopy } from "./lib/season";
import {
  composeShareHref,
  parseShareSearch,
  sanitizeFromName,
  serializeShareSearch,
  SHARE_HISTORY_SYNC_MS,
  shouldCommitTimelineDay,
  shouldWriteShareHistory,
  type ShareCatalog,
} from "./lib/shareLink";

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

const previewParams = new URLSearchParams(window.location.search);
const visualStyle: VisualStyle =
  previewParams.get("style") === "editorial" ? "editorial" : "photographic";
const shareCatalog: ShareCatalog = {
  templates: compositionTemplates,
  plantIds: new Set<string>(plants.map((plant) => plant.id)),
  defaultTemplateId,
};
const initialShare = parseShareSearch(previewParams, shareCatalog);
const preservePlantParam = previewParams.has("plant");
const initialPlanting = initialShare.planting as PlantId[];
const initialSelectedId = initialShare.selectedPlantId as PlantId;

const seasonNarrative = (day: number, profiles: PlantProfile[]) => {
  if (day < 95 || day > 334)
    return {
      eyebrow: "The quiet season",
      title: "Structure becomes color.",
      copy: profiles.slice(0, 3).map((profile) => profile.seasonalNotes.winter).join(" "),
    };
  if (day < 152)
    return {
      eyebrow: "The opening act",
      title: "Spring begins in layers.",
      copy: profiles.slice(0, 3).map((profile) => profile.seasonalNotes.spring).join(" "),
    };
  if (day < 244)
    return {
      eyebrow: "The garden at full volume",
      title: "Summer holds the center.",
      copy: profiles.slice(0, 3).map((profile) => profile.seasonalNotes.summer).join(" "),
    };
  if (day < 315)
    return {
      eyebrow: "The second bloom",
      title: "Foliage becomes the flower.",
      copy: profiles.slice(0, 3).map((profile) => profile.seasonalNotes.fall).join(" "),
    };
  return {
    eyebrow: "The reveal",
    title: "The framework returns.",
    copy: profiles.slice(0, 3).map((profile) => profile.seasonalNotes.winter).join(" "),
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
  const listRef = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState({ start: false, end: false });

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const update = () => {
      const maxX = node.scrollWidth - node.clientWidth;
      const maxY = node.scrollHeight - node.clientHeight;
      setPeek({
        start: node.scrollLeft > 6 || node.scrollTop > 6,
        end:
          (maxX > 6 && node.scrollLeft < maxX - 6) ||
          (maxY > 6 && node.scrollTop < maxY - 6),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [profiles]);

  return (
    <aside
      className={`plant-rail${peek.start ? " has-peek-start" : ""}${peek.end ? " has-peek-end" : ""}`}
      aria-label="Plants in this composition"
    >
      <p className="rail-kicker">In this composition</p>
      <div className="plant-list" ref={listRef}>
        {profiles.map((plant, index) => {
          const state = plantState(plant, day);
          const active =
            state.bloom > 0.18 ||
            state.fruit > 0.18 ||
            state.fall > 0.2 ||
            plant.evergreen ||
            (plant.group === "winter" && state.leaves < 0.1);
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

function SelectedPlant({
  plant,
  day,
  onClose,
}: {
  plant: PlantProfile;
  day: number;
  onClose?: () => void;
}) {
  const timingEvidence = seasonalEvidenceFor(plant);
  const dayLabel = (dayOfYear: number) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2025, 0, dayOfYear)));

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
        <div className="selected-plant-tools">
          <span className="phase-pill">{dayPhase(plant, day)}</span>
          {onClose ? (
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label="Close plant record"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="plant-facts">
        <span><Ruler size={14} />{plant.matureSize}</span>
        <span><SunMedium size={14} />{plant.light}</span>
        <span><Droplets size={14} />{plant.moisture}</span>
        <span><MapPin size={14} />{plant.zones}</span>
        <span><CalendarDays size={14} />{plant.bloomRange}</span>
        <span><Leaf size={14} />{plant.foliageBehavior}</span>
      </div>
      {plant.caveat && <p className="plant-caveat">{plant.caveat}</p>}
      <div className="timing-evidence">
        <strong>Representative timing · low date confidence</strong>
        <p>
          Exact day bounds are visual interpolation for Chicago / Zone 6a, not
          observed local phenology or a forecast. Seasonal traits and order are
          anchored to {plant.sourceLabel}.
        </p>
        <details>
          <summary>View encoded seasonal trace</summary>
          <dl>
            {timingEvidence.map((item) => (
              <div key={item.event}>
                <dt>{item.event}</dt>
                <dd>
                  {item.windows.map((window) =>
                    `${dayLabel(window[0])}–${dayLabel(Math.min(365, window[1]))}`,
                  ).join(" · ")}
                  <span>{item.provenance.replace("-", " ")} · {item.confidence}</span>
                </dd>
              </div>
            ))}
          </dl>
          <small>
            The five seasonal billboards are interpretive illustrations of the
            cited habit and traits, not specimen photographs.
          </small>
        </details>
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
        <div><dt><CalendarDays size={15} /> Intent</dt><dd>Year-round interest</dd></div>
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
        Seasonal timing is a low-confidence visual interpolation for a
        representative Chicago year, not observed local phenology or a weather
        forecast. Exact bounds and their source scope are disclosed per plant.
      </p>
    </aside>
  );
}

function CompositionPanel({
  planting,
  profiles,
  activeTemplate,
  templateCustomized,
  libraryAccess,
  onSizeChange,
  onTemplateChange,
  onPlantChange,
  onRestoreTemplate,
  onClose,
}: {
  planting: PlantId[];
  profiles: PlantProfile[];
  activeTemplate: CompositionTemplate;
  templateCustomized: boolean;
  libraryAccess: LibraryAccess;
  onSizeChange: (size: ClusterSize) => void;
  onTemplateChange: (template: CompositionTemplate) => void;
  onPlantChange: (index: number, plantId: PlantId) => void;
  onRestoreTemplate: () => void;
  onClose: () => void;
}) {
  const sizes: { value: ClusterSize; label: string }[] = [
    { value: 3, label: "Focused" },
    { value: 5, label: "Layered" },
    { value: 7, label: "Full" },
  ];
  const [activeSlot, setActiveSlot] = useState(0);
  const selectedProfile =
    profiles.find((profile) => profile.id === planting[activeSlot]) ?? profiles[0];
  const [activeGroup, setActiveGroup] = useState<PlantGroup>(
    selectedProfile?.group ?? "summer",
  );
  const visibleProfiles = profiles.filter((profile) => profile.group === activeGroup);
  const recommendedTemplates = templatesForSize(planting.length as ClusterSize);

  useEffect(() => {
    if (activeSlot >= planting.length) setActiveSlot(Math.max(0, planting.length - 1));
  }, [activeSlot, planting.length]);

  const chooseSlot = (index: number) => {
    setActiveSlot(index);
    const profile = profiles.find((candidate) => candidate.id === planting[index]);
    if (profile) setActiveGroup(profile.group);
  };

  return (
    <aside className="composition-panel" aria-label="Edit planting composition">
      <div className="conditions-heading">
        <div>
          <p>Year-round composition</p>
          <h2>Design for the full year</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close composition editor">
          <X size={18} />
        </button>
      </div>

      <p className="composition-intro">
        Choose a position, then compare plants by how they carry the composition
        through the year. The authored layers stay fixed while species, scale, and
        season change.
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

      <section
        className="template-picker"
        aria-label="Recommended planting arrangements"
      >
        <div className="template-picker-heading">
          <div>
            <h3>Recommended arrangements</h3>
            <span>Three editor-curated starting points</span>
          </div>
          <span>{planting.length} plants</span>
        </div>
        <div className="template-list">
          {recommendedTemplates.map((template, index) => {
            const isActive = template.id === activeTemplate.id;
            const isAvailable = templateIsAvailable(template, libraryAccess);
            const speciesCount = new Set(template.planting).size;
            const accents = [...new Set(template.planting)].map(
              (plantId) => plants.find((profile) => profile.id === plantId)?.accent,
            );

            return (
              <button
                type="button"
                className={isActive ? "template-card is-active" : "template-card"}
                key={template.id}
                data-template-id={template.id}
                aria-pressed={isActive}
                disabled={!isAvailable}
                onClick={() => onTemplateChange(template)}
              >
                <span className="template-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="template-card-copy">
                  <span className="template-title-row">
                    <strong>{template.name}</strong>
                    {isActive && (
                      <em>{templateCustomized ? "Customized" : "Selected"}</em>
                    )}
                  </span>
                  <small>{template.summary}</small>
                  <span className="template-cadence" aria-label="Seasonal cadence">
                    <span><b>W</b>{template.seasonalCarry.winter}</span>
                    <span><b>Sp</b>{template.seasonalCarry.spring}</span>
                    <span><b>Su</b>{template.seasonalCarry.summer}</span>
                    <span><b>F</b>{template.seasonalCarry.fall}</span>
                  </span>
                </span>
                <span className="template-meta" aria-label={`${speciesCount} species`}>
                  <span className="template-swatches" aria-hidden="true">
                    {accents.map((accent, accentIndex) => (
                      <i
                        key={`${template.id}-accent-${accentIndex}`}
                        style={{ background: accent }}
                      />
                    ))}
                  </span>
                  <small>{speciesCount} species</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="planting-choices">
        <div className="planting-choices-heading">
          <div>
            <strong>
              {templateCustomized ? `Customized from ${activeTemplate.name}` : activeTemplate.name}
            </strong>
            <span>{new Set(planting).size} species · {planting.length} plants</span>
          </div>
          <button
            type="button"
            onClick={onRestoreTemplate}
            disabled={!templateCustomized}
          >
            <RotateCcw size={13} /> Restore
          </button>
        </div>
        <div className="planting-slot-list">
          {planting.map((plantId, index) => (
            <button
              type="button"
              className={activeSlot === index ? "planting-slot is-active" : "planting-slot"}
              key={`slot-${index + 1}`}
              onClick={() => chooseSlot(index)}
              aria-pressed={activeSlot === index}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="slot-plant-name">
                {profiles.find((profile) => profile.id === plantId)?.shortName}
              </span>
              <span
                className="choice-swatch"
                style={{ background: profiles.find((profile) => profile.id === plantId)?.accent }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="plant-library">
        <div className="plant-library-heading">
          <div>
            <strong>Replace position {String(activeSlot + 1).padStart(2, "0")}</strong>
            <span>Choose by seasonal role</span>
          </div>
          <span>{profiles.length} compatible choices</span>
        </div>
        <div className="plant-group-tabs" role="tablist" aria-label="Plant design roles">
          {plantGroups.map((group) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeGroup === group.id}
              className={activeGroup === group.id ? "is-active" : ""}
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
        <div className="plant-option-grid" role="tabpanel">
          {visibleProfiles.map((profile) => (
            <button
              type="button"
              className={planting[activeSlot] === profile.id ? "plant-option is-active" : "plant-option"}
              key={profile.id}
              onClick={() => onPlantChange(activeSlot, profile.id)}
              aria-pressed={planting[activeSlot] === profile.id}
            >
              <span
                className="plant-option-image"
                style={{ backgroundImage: `url(${profile.assets.bloom})` }}
                aria-hidden="true"
              />
              <span className="plant-option-copy">
                <strong>{profile.shortName}</strong>
                <small>{profile.role}</small>
                <em>{profile.matureSize.split(" × ")[0]}</em>
              </span>
            </button>
          ))}
        </div>
        {selectedProfile?.caveat && (
          <p className="library-caveat">
            <Info size={12} /> {selectedProfile.caveat}
          </p>
        )}
      </div>

      <p className="composition-note">
        All choices tolerate Zone 6a and part shade. Their moisture and pollination
        caveats remain visible; mature spacing still needs confirmation in the real bed.
      </p>
    </aside>
  );
}

const copyShareHref = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.append(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
};

function SharePanel({
  authorName,
  day,
  templateName,
  clusterCount,
  customized,
  shareHref,
  onAuthorNameChange,
  onClose,
}: {
  authorName: string;
  day: number;
  templateName: string;
  clusterCount: number;
  customized: boolean;
  shareHref: string;
  onAuthorNameChange: (value: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const date = dayToDate(day);

  const copyLink = async () => {
    const ok = await copyShareHref(shareHref);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <aside className="share-panel" aria-label="Send this living bed">
      <div className="conditions-heading">
        <div>
          <p>Send this living bed</p>
          <h2>Copy a living-bed link</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close share panel">
          <X size={18} />
        </button>
      </div>
      <p className="share-intro">
        Park the date on the timeline, put your name on the composition, and send
        the link. The recipient lands on this bed and can move through the year
        without opening the editor.
      </p>
      <label className="share-from-field" htmlFor="share-from-name">
        <span>From</span>
        <input
          id="share-from-name"
          name="from"
          type="text"
          autoComplete="name"
          maxLength={80}
          placeholder="Your name, studio, or nursery"
          value={authorName}
          onChange={(event) => onAuthorNameChange(event.currentTarget.value)}
          onBlur={() => onAuthorNameChange(sanitizeFromName(authorName))}
        />
      </label>
      <dl className="share-meta">
        <div>
          <dt>Parked date</dt>
          <dd>{date.label}</dd>
        </div>
        <div>
          <dt>Composition</dt>
          <dd>
            {customized ? `Customized from ${templateName}` : templateName}
            <small>
              {clusterCount} plants · recipient can scrub the year
            </small>
          </dd>
        </div>
      </dl>
      <button className="copy-link-button" type="button" onClick={copyLink}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <p className="share-url" aria-label="Shareable link">
        {shareHref}
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
  const pointerAdjusting = useRef(false);
  const pointerClear = useRef(0);
  const date = dayToDate(day);
  const season = seasonCopy(day);
  const setPointerAdjusting = (active: boolean) => {
    window.clearTimeout(pointerClear.current);
    if (active) {
      pointerAdjusting.current = true;
      return;
    }
    // Native range `input` can arrive after pointerup; keep the gesture
    // open for one frame so a real scrub still commits.
    pointerClear.current = window.setTimeout(() => {
      pointerAdjusting.current = false;
    }, 50);
  };
  const commitRangeDay = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextDay = Number(event.currentTarget.value);
    if (!shouldCommitTimelineDay(day, nextDay, pointerAdjusting.current)) {
      event.currentTarget.value = String(day);
      return;
    }
    onDayChange(nextDay);
  };
  return (
    <section className="timeline-shell" aria-label="Year timeline" data-parked-day={day}>
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
            onPointerDown={() => setPointerAdjusting(true)}
            onPointerUp={() => setPointerAdjusting(false)}
            onPointerCancel={() => setPointerAdjusting(false)}
            onTouchStart={() => setPointerAdjusting(true)}
            onTouchEnd={() => setPointerAdjusting(false)}
            onTouchCancel={() => setPointerAdjusting(false)}
            onChange={commitRangeDay}
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
              <span
                key={tick.label}
                className={date.shortMonth === tick.label ? "is-current" : ""}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PHONE_LAYOUT_QUERY = "(max-width: 760px)";

function usePhoneLayout() {
  const [phoneLayout, setPhoneLayout] = useState(
    () => window.matchMedia?.(PHONE_LAYOUT_QUERY).matches ?? false,
  );
  useEffect(() => {
    const media = window.matchMedia?.(PHONE_LAYOUT_QUERY);
    if (!media) return;
    const onChange = () => setPhoneLayout(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return phoneLayout;
}

export default function App() {
  const libraryAccess: LibraryAccess = "full-library";
  const phoneLayout = usePhoneLayout();
  const [day, setDay] = useState(initialShare.day);
  const [selectedId, setSelectedId] = useState<PlantId>(initialSelectedId);
  const [planting, setPlanting] = useState<PlantId[]>(() => [...initialPlanting]);
  const [activeTemplateId, setActiveTemplateId] = useState(initialShare.templateId);
  const [authorName, setAuthorName] = useState(initialShare.from);
  const [playing, setPlaying] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [compositionOpen, setCompositionOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [nativeOnly, setNativeOnly] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    [],
  );
  const visibleViews = phoneLayout ? gardenViews.slice(0, 1) : gardenViews;
  const availableProfiles = useMemo(
    () => compositionPlants(nativeOnly, libraryAccess),
    [libraryAccess, nativeOnly],
  );
  const activePlants = useMemo(() => {
    const profileById = new Map(availableProfiles.map((plant) => [plant.id, plant]));
    return [...new Set(planting)]
      .map((id) => profileById.get(id))
      .filter((profile): profile is PlantProfile => Boolean(profile));
  }, [availableProfiles, planting]);
  const plantCounts = useMemo(
    () => {
      const counts = Object.fromEntries(
        plants.map((plant) => [plant.id, 0]),
      ) as Record<PlantId, number>;
      planting.forEach((plantId) => {
        counts[plantId] += 1;
      });
      return counts;
    },
    [planting],
  );
  const instances = useMemo(
    () => buildComposition(planting, nativeOnly, libraryAccess),
    [libraryAccess, nativeOnly, planting],
  );
  const narrative = seasonNarrative(day, activePlants);
  const selectedPlant = activePlants.find((plant) => plant.id === selectedId) ?? activePlants[0];
  const activeTemplate =
    compositionTemplates.find((template) => template.id === activeTemplateId) ??
    compositionTemplates[0];
  const templateCustomized =
    activeTemplate.planting.length !== planting.length ||
    activeTemplate.planting.some((plantId, index) => plantId !== planting[index]);
  const shareSearch = serializeShareSearch(
    {
      day,
      templateId: activeTemplateId,
      planting,
      from: authorName,
      templatePlanting: activeTemplate.planting,
    },
    {
      style: visualStyle,
      plant: preservePlantParam ? selectedId : null,
    },
  );
  const shareQuery = shareSearch.toString();
  const shareHref = composeShareHref(window.location, shareQuery);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setDay((current) => (current >= 365 ? 1 : current + 1));
    }, 42);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  useEffect(() => {
    if (!shouldWriteShareHistory(playing)) return;
    const writeShareUrl = () => {
      const next = `${window.location.pathname}${shareQuery ? `?${shareQuery}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;
      try {
        window.history.replaceState(null, "", next);
      } catch {
        // Safari and Chrome throttle History API writes. Do not take down playback.
      }
    };
    const timer = window.setTimeout(writeShareUrl, SHARE_HISTORY_SYNC_MS);
    return () => window.clearTimeout(timer);
  }, [playing, shareQuery]);

  useEffect(() => {
    document.title = authorName
      ? `${authorName} · Year-Round Interest`
      : "Year-Round Interest";
  }, [authorName]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConditionsOpen(false);
        setCompositionOpen(false);
        setShareOpen(false);
        setDetailsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectPlant = (id: PlantId) => {
    setSelectedId(id);
    if (phoneLayout) {
      setConditionsOpen(false);
      setCompositionOpen(false);
      setShareOpen(false);
      setDetailsOpen(true);
    }
  };

  const closeDetails = () => setDetailsOpen(false);
  const markSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    if (!activePlants.some((plant) => plant.id === selectedId)) {
      setSelectedId(activePlants[0].id);
    }
  }, [activePlants, selectedId]);

  const changeClusterSize = (size: ClusterSize) => {
    const template = previewTemplateForSize(size);
    setActiveTemplateId(template.id);
    setPlanting([...template.planting]);
    setSelectedId(template.planting[1] ?? template.planting[0]);
  };

  const applyTemplate = (template: CompositionTemplate) => {
    if (!templateIsAvailable(template, libraryAccess)) return;
    setActiveTemplateId(template.id);
    setPlanting([...template.planting]);
    setSelectedId(template.planting[1] ?? template.planting[0]);
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
    <main
      className={`experience-shell${visualStyle === "editorial" ? " is-editorial" : ""}${phoneLayout ? " is-phone" : ""}${detailsOpen ? " is-details-open" : ""}`}
      data-sent-from={authorName || undefined}
      data-layout={phoneLayout ? "phone" : "desktop"}
    >
      <a href="#year-timeline" className="skip-link">Skip to year timeline</a>
      <section
        className="scene-gallery"
        aria-label={
          phoneLayout
            ? "Garden portrait of one year-round composition"
            : "Four synchronized views of one year-round garden composition"
        }
      >
        {visibleViews.map((view, index) => (
          <article
            key={view.id}
            className={`${index === 0 ? "scene-frame is-primary" : "scene-frame"}${sceneReady ? " is-ready" : ""}`}
            data-view={view.id}
            aria-label={view.label}
          >
            {phoneLayout && (
              <div className="scene-pending" role="status" aria-live="polite">
                <span className="scene-pending-orb" aria-hidden="true" />
                <p>Loading the year</p>
              </div>
            )}
            <div className="scene-layer">
              <GardenScene
                day={day}
                selectedId={selectedId}
                onSelect={selectPlant}
                reducedMotion={reducedMotion || index > 0}
                instances={instances}
                viewId={view.id as GardenViewId}
                visualStyle={visualStyle}
                primary={index === 0}
                onReady={index === 0 ? markSceneReady : undefined}
              />
            </div>
            <div className="atmosphere" aria-hidden="true" />
            <div className="photo-stamp" aria-hidden="true">
              <span>{view.number} / 04</span>
              <span className="photo-stamp-copy">
                <strong>{view.label}</strong>
                <small>{view.note}</small>
              </span>
            </div>
          </article>
        ))}
      </section>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Year-Round Interest home">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy">
            <strong>Year-Round<br />Interest</strong>
            <small>
              {authorName
                ? `A living bed from ${authorName}`
                : "See the whole year before you plant."}
            </small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="region-label"><MapPin size={14} />Chicago · Zone 6a</span>
          <button
            className="composition-button"
            onClick={() => {
              setConditionsOpen(false);
              setShareOpen(false);
              setCompositionOpen(true);
            }}
          >
            <Sprout size={16} /> Edit planting
          </button>
          <button
            className="share-button"
            onClick={() => {
              setConditionsOpen(false);
              setCompositionOpen(false);
              setShareOpen(true);
            }}
          >
            <Link2 size={16} /> Send bed
          </button>
          <button
            className="conditions-button"
            onClick={() => {
              setCompositionOpen(false);
              setShareOpen(false);
              setConditionsOpen(true);
            }}
          >
            <Settings2 size={16} /> Conditions
          </button>
        </div>
      </header>

      <section className="story-panel" aria-live="polite">
        {authorName && (
          <p className="sent-byline">Sent by {authorName}</p>
        )}
        <p className="story-eyebrow">{narrative.eyebrow}</p>
        <h1>{narrative.title}</h1>
        <div className="story-rule" />
        <p className="story-copy">{narrative.copy}</p>
      </section>

      <PlantRail
        day={day}
        selectedId={selectedId}
        onSelect={selectPlant}
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
      {detailsOpen && phoneLayout && (
        <button
          className="panel-scrim"
          aria-label="Close plant record"
          onClick={closeDetails}
        />
      )}
      <div id="selected-plant-details" className={detailsOpen ? "detail-wrap is-open" : "detail-wrap"}>
        <SelectedPlant
          plant={selectedPlant}
          day={day}
          onClose={phoneLayout ? closeDetails : undefined}
        />
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
            activeTemplate={activeTemplate}
            templateCustomized={templateCustomized}
            libraryAccess={libraryAccess}
            onSizeChange={changeClusterSize}
            onTemplateChange={applyTemplate}
            onPlantChange={changePlant}
            onRestoreTemplate={() => applyTemplate(activeTemplate)}
            onClose={() => setCompositionOpen(false)}
          />
        </>
      )}
      {shareOpen && (
        <>
          <button
            className="panel-scrim"
            aria-label="Dismiss send panel"
            onClick={() => setShareOpen(false)}
          />
          <SharePanel
            authorName={authorName}
            day={day}
            templateName={activeTemplate.name}
            clusterCount={planting.length}
            customized={templateCustomized}
            shareHref={shareHref}
            onAuthorNameChange={setAuthorName}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}
    </main>
  );
}
