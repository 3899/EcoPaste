import { Button, Input, Popover, Select, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProListItem from "@/components/ProListItem";
import type { ScheduleConfig as ScheduleConfigType, ScheduleMode } from "@/types/store";

interface Props {
  title: string;
  description: string;
  value: ScheduleConfigType;
  onChange: (config: Partial<ScheduleConfigType>) => void;
}

const SCHEDULE_MODE_OPTIONS: { label: string; value: ScheduleMode; labelKey: string }[] = [
  { label: "定时", value: "fixed", labelKey: "preference.data_backup.webdav.schedule.mode_fixed" },
  { label: "间隔", value: "interval", labelKey: "preference.data_backup.webdav.schedule.mode_interval" },
  { label: "Cron", value: "cron", labelKey: "preference.data_backup.webdav.schedule.mode_cron" },
];

const INTERVAL_OPTIONS = [
  { label: "1分钟", value: 1, labelKey: "preference.data_backup.webdav.schedule.interval_1m" },
  { label: "5分钟", value: 5, labelKey: "preference.data_backup.webdav.schedule.interval_5m" },
  { label: "15分钟", value: 15, labelKey: "preference.data_backup.webdav.schedule.interval_15m" },
  { label: "30分钟", value: 30, labelKey: "preference.data_backup.webdav.schedule.interval_30m" },
  { label: "1小时", value: 60, labelKey: "preference.data_backup.webdav.schedule.interval_1h" },
  { label: "2小时", value: 120, labelKey: "preference.data_backup.webdav.schedule.interval_2h" },
  { label: "6小时", value: 360, labelKey: "preference.data_backup.webdav.schedule.interval_6h" },
  { label: "12小时", value: 720, labelKey: "preference.data_backup.webdav.schedule.interval_12h" },
  { label: "24小时", value: 1440, labelKey: "preference.data_backup.webdav.schedule.interval_24h" },
  { label: "48小时", value: 2880, labelKey: "preference.data_backup.webdav.schedule.interval_48h" },
  { label: "72小时", value: 4320, labelKey: "preference.data_backup.webdav.schedule.interval_72h" },
];

const REPEAT_OPTIONS = [
  { label: "每小时", value: "hourly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_hourly" },
  { label: "每天", value: "daily" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_daily" },
  { label: "每周", value: "weekly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_weekly" },
  { label: "每两周", value: "biweekly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_biweekly" },
  { label: "每月", value: "monthly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_monthly" },
  { label: "每季度", value: "quarterly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_quarterly" },
  { label: "每半年", value: "semi_annual" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_semi_annual" },
  { label: "每年", value: "yearly" as const, labelKey: "preference.data_backup.webdav.schedule.repeat_yearly" },
];

// ─── iOS-style scroll wheel column (infinite circular loop) ──
const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

interface WheelColumnProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

const WheelColumn = ({ items, value, onChange, format }: WheelColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = items.length;
  // Triple the items for infinite loop: [...items, ...items, ...items]
  const tripled = [...items, ...items, ...items];
  const selectedIdx = items.indexOf(value);
  const [currentIdx, setCurrentIdx] = useState(count + Math.max(0, selectedIdx));
  const isScrolling = useRef(false);

  useEffect(() => {
    // Only externally sync if we aren't actively scrolling
    if (isScrolling.current) return;
    const idx = items.indexOf(value);
    if (idx >= 0) {
      const newIdx = count + idx;
      if (currentIdx % count !== idx) {
        setCurrentIdx(newIdx);
        if (containerRef.current) {
          containerRef.current.scrollTop = newIdx * ITEM_HEIGHT;
        }
      }
    }
  }, [value, items]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = currentIdx * ITEM_HEIGHT;
    }
  }, []);

  const snapTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrolling.current = true;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_HEIGHT);
    setCurrentIdx(idx);

    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      isScrolling.current = false;
      if (!containerRef.current) return;
      let finalIdx = idx;
      
      // If we scroll into the first or third copy, jump instantly to the middle copy
      if (finalIdx < count) {
        finalIdx += count;
        containerRef.current.style.scrollSnapType = "none"; // temp disable snap for jump
        containerRef.current.scrollTop = finalIdx * ITEM_HEIGHT;
        // restore snap in next tick
        setTimeout(() => { if (containerRef.current) containerRef.current.style.scrollSnapType = "y mandatory" }, 0);
      } else if (finalIdx >= count * 2) {
        finalIdx -= count;
        containerRef.current.style.scrollSnapType = "none";
        containerRef.current.scrollTop = finalIdx * ITEM_HEIGHT;
        setTimeout(() => { if (containerRef.current) containerRef.current.style.scrollSnapType = "y mandatory" }, 0);
      }

      setCurrentIdx(finalIdx);
      onChange(tripled[finalIdx]);
    }, 150);
  };

  return (
    <div
      style={{
        height: WHEEL_HEIGHT,
        overflow: "hidden",
        position: "relative",
        width: 56,
      }}
    >
      {/* Center highlight band */}
      <div
        style={{
          position: "absolute",
          top: ITEM_HEIGHT * 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          background: "var(--ant-color-primary-bg, rgba(22,119,255,0.08))",
          borderRadius: 6,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        onScroll={handleScroll}
        ref={containerRef}
        style={{
          height: "100%",
          overflowY: "auto",
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
          scrollSnapType: "y mandatory",
          position: "relative",
          zIndex: 2,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tripled.map((item, idx) => {
          const isSelected = currentIdx === idx;
          return (
            <div
              key={idx}
              style={{
                height: ITEM_HEIGHT,
                lineHeight: `${ITEM_HEIGHT}px`,
                textAlign: "center",
                fontSize: 14,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? "var(--ant-color-primary, #1677ff)" : undefined,
                opacity: isSelected ? 1 : 0.45,
                cursor: "pointer",
                scrollSnapAlign: "center",
                transition: "color 0.15s, opacity 0.15s, font-weight 0.15s",
              }}
              onClick={() => {
                setCurrentIdx(idx);
                onChange(tripled[idx]);
                containerRef.current?.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
              }}
            >
              {format ? format(item) : String(item).padStart(2, "0")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Time wheel picker with confirm + now ────────────────────
interface TimeWheelPickerProps {
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  showHour?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const TimeWheelPicker = ({ hour, minute, onConfirm, showHour = true }: TimeWheelPickerProps) => {
  const { t } = useTranslation();
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  const [open, setOpen] = useState(false);

  const displayText = showHour
    ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    : `${String(minute).padStart(2, "0")} ${t("preference.data_backup.webdav.schedule.minute", "分")}`;

  const handleNow = () => {
    const now = new Date();
    setTempHour(now.getHours());
    setTempMinute(now.getMinutes());
  };

  const content = (
    <div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {showHour && (
          <WheelColumn items={HOURS} value={tempHour} onChange={setTempHour} />
        )}
        {showHour && (
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: `${WHEEL_HEIGHT}px` }}>:</span>
        )}
        <WheelColumn items={MINUTES} value={tempMinute} onChange={setTempMinute} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center", padding: "0 4px" }}>
        <span
          onClick={handleNow}
          style={{ 
            color: "var(--ant-color-primary, #1677ff)", 
            cursor: "pointer", 
            fontSize: 14,
            fontWeight: 500,
            userSelect: "none"
          }}
        >
          {t("preference.data_backup.webdav.schedule.now", "此刻").replace(/\s/g, "")}
        </span>
        <Button
          onClick={() => {
            onConfirm(showHour ? tempHour : hour, tempMinute);
            setOpen(false);
          }}
          size="small"
          type="primary"
        >
          {t("preference.data_backup.webdav.schedule.confirm", "确定")}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setTempHour(hour);
          setTempMinute(minute);
        }
      }}
      open={open}
      placement="bottom"
      trigger="click"
    >
      <Button style={{ width: 90, textAlign: "center" }}>{displayText}</Button>
    </Popover>
  );
};

// ─── Main component ─────────────────────────────────────────
const ScheduleConfig = ({ title, description, value, onChange }: Props) => {
  const { t } = useTranslation();

  const modeOptions = SCHEDULE_MODE_OPTIONS.map((opt) => ({
    label: t(opt.labelKey, opt.label),
    value: opt.value,
  }));

  const intervalOptions = INTERVAL_OPTIONS.map((opt) => ({
    label: t(opt.labelKey, opt.label),
    value: opt.value,
  }));

  const repeatOptions = REPEAT_OPTIONS.map((opt) => ({
    label: t(opt.labelKey, opt.label),
    value: opt.value,
  }));

  return (
    <ProListItem description={description} title={title}>
      <Space direction="vertical" size={8}>
        <Space size={8}>
          <Select
            onChange={(mode: ScheduleMode) => onChange({ mode })}
            options={modeOptions}
            style={{ width: 90 }}
            value={value.mode}
          />
          {value.mode === "interval" && (
            <Select
              onChange={(intervalMinutes: number) => onChange({ intervalMinutes })}
              options={intervalOptions}
              style={{ width: 90 }}
              value={value.intervalMinutes}
            />
          )}
          {value.mode === "fixed" && (
            <>
              <Select
                onChange={(fixedRepeat: ScheduleConfigType["fixedRepeat"]) =>
                  onChange({ fixedRepeat })
                }
                options={repeatOptions}
                style={{ width: 90 }}
                value={value.fixedRepeat}
              />
              {value.fixedRepeat !== "hourly" ? (
                <TimeWheelPicker
                  hour={value.fixedHour}
                  minute={value.fixedMinute}
                  onConfirm={(h, m) => onChange({ fixedHour: h, fixedMinute: m })}
                />
              ) : (
                <TimeWheelPicker
                  hour={value.fixedHour}
                  minute={value.fixedMinute}
                  onConfirm={(_, m) => onChange({ fixedMinute: m })}
                  showHour={false}
                />
              )}
            </>
          )}
          {value.mode === "cron" && (
            <Input
              onChange={(e) => onChange({ cronExpression: e.target.value })}
              placeholder="0 */5 * * *"
              style={{ width: 180 }}
              value={value.cronExpression}
            />
          )}
        </Space>
      </Space>
    </ProListItem>
  );
};

export default ScheduleConfig;
