import React from 'react';
import { useApp } from '../context/AppContext';
import {
  VESSEL_REGISTRY,
  VOYAGE_SCHEDULE,
  AIS_POSITIONS,
  VESSEL_TELEMETRY,
  WEATHER_SNAPSHOTS,
  PORT_CONSTRAINTS,
  CARGO_CONSTRAINTS,
  CREW_CONSTRAINTS,
  CMMS_CONSTRAINTS,
} from '../data/fixtureBundle';
import {
  Compass,
  Gauge,
  Wind,
  Waves,
  Anchor,
  Box,
  Users,
  Wrench,
  AlertTriangle,
  Clock,
  Radio,
  MapPin,
  Flame,
  Snowflake,
  ShieldCheck,
} from 'lucide-react';

export const VoyageContextView: React.FC = () => {
  const { currentDisruption, clockOffsetSeconds } = useApp();
  const caseId = currentDisruption.case_id;

  const vessel = VESSEL_REGISTRY.find((v) => v.vessel_id === currentDisruption.vessel_id) || VESSEL_REGISTRY[0];
  const voyage = VOYAGE_SCHEDULE.find((voy) => voy.voyage_id === currentDisruption.voyage_id);
  const ais = AIS_POSITIONS.find((a) => a.case_id === caseId);
  const telemetry = VESSEL_TELEMETRY.find((t) => t.case_id === caseId);
  const weather = WEATHER_SNAPSHOTS.find((w) => w.case_id === caseId);
  const portConstraints = PORT_CONSTRAINTS.filter((p) => p.case_id === caseId);
  const cargo = CARGO_CONSTRAINTS.find((c) => c.case_id === caseId);
  const crew = CREW_CONSTRAINTS.find((c) => c.case_id === caseId);
  const cmms = CMMS_CONSTRAINTS.find((m) => m.case_id === caseId);

  const isBearingCritical = (telemetry?.main_engine_bearing_temp_c || 0) > 85;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold font-mono text-slate-900">
              {vessel.vessel_name} ({vessel.vessel_id})
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {vessel.vessel_class} CLASS
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Flag: {vessel.flag}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            IMO: {vessel.imo_number} • Edge Agent v{vessel.edge_agent_version} • Route: {currentDisruption.route_region}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
          <div>
            <span className="text-slate-500">VOYAGE:</span>
            <div className="font-bold text-slate-900">{voyage?.voyage_id}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-500">DESTINATION:</span>
            <div className="font-bold text-blue-600">{voyage?.destination_port}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-500">SCHEDULED ETA:</span>
            <div className="text-slate-900 font-medium">{voyage?.scheduled_eta_utc.slice(5, 16).replace('T', ' ')}Z</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar / AIS Position Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <Compass className="h-4 w-4 text-blue-600" /> AIS Radar & Heading
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                {ais?.quality || 'GOOD'}
              </span>
            </div>

            {/* Visual Radar Scope */}
            <div className="relative h-44 my-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
              <div className="w-36 h-36 rounded-full border border-sky-500/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-sky-500/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-sky-500/40 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                  </div>
                </div>
              </div>
              <div
                className="absolute w-16 h-0.5 bg-sky-400 origin-left"
                style={{ transform: `rotate(${ais?.cog_degrees || 0}deg)` }}
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400">
                LAT: {ais?.lat.toFixed(2)}° | LON: {ais?.lon.toFixed(2)}°
              </div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-sky-300 font-bold">
                COG: {ais?.cog_degrees}°
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100">
            <div>
              <span className="text-slate-500">SPEED (SOG):</span>
              <div className="font-bold text-slate-900">{ais?.sog_knots.toFixed(1)} knots</div>
            </div>
            <div>
              <span className="text-slate-500">RECORD ID:</span>
              <div className="text-slate-700 truncate">{ais?.provider_record_id}</div>
            </div>
          </div>
        </div>

        {/* Machinery Telemetry Stream */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <Gauge className="h-4 w-4 text-blue-600" /> Machinery Telemetry
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isBearingCritical
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {telemetry?.quality || 'NORMAL'}
              </span>
            </div>

            <div className="space-y-3 my-2">
              {/* Bearing Temperature Gauge */}
              <div className={`p-3 rounded-lg border ${isBearingCritical ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-rose-500" /> ME Bearing Temp:
                  </span>
                  <span className={`font-bold ${isBearingCritical ? 'text-rose-600 text-sm' : 'text-slate-900'}`}>
                    {telemetry?.main_engine_bearing_temp_c}°C
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isBearingCritical ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, ((telemetry?.main_engine_bearing_temp_c || 70) / 100) * 100)}%` }}
                  />
                </div>
                {isBearingCritical && (
                  <div className="text-[10px] font-mono text-rose-700 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Critical Hold Triggered (Safe limit 80°C)
                  </div>
                )}
              </div>

              {/* Engine Load */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-600">Main Engine Load:</span>
                  <span className="font-bold text-slate-900">{telemetry?.engine_load_pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${telemetry?.engine_load_pct}%` }} />
                </div>
              </div>

              {/* Fuel Remaining & Consumption */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Fuel Rate:</span>
                  <div className="font-bold text-slate-900">{telemetry?.fuel_rate_tph} t/h</div>
                </div>
                <div>
                  <span className="text-slate-500">Remaining:</span>
                  <div className="font-bold text-slate-900">{telemetry?.fuel_remaining_tonnes} MT</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-100 flex justify-between">
            <span>Sequence: #{telemetry?.sequence_no}</span>
            <span>Clock Skew: {clockOffsetSeconds}s</span>
          </div>
        </div>

        {/* Ocean & Weather Snapshot */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <Waves className="h-4 w-4 text-blue-600" /> Ocean & Meteorology
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  weather?.risk === 'SEVERE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : weather?.risk === 'ELEVATED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {weather ? `${weather.risk} RISK` : 'UNAVAILABLE'}
              </span>
            </div>

            {weather ? (
              <div className="space-y-2.5 my-2">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-blue-600" /> Sustained Wind:
                  </span>
                  <span className="font-bold text-slate-900">{weather.wind_knots} knots</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5 text-blue-600" /> Significant Wave:
                  </span>
                  <span className="font-bold text-slate-900">{weather.wave_height_m} m</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">Current Velocity:</span>
                  <span className="font-bold text-slate-900">{weather.current_knots} knots</span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-xs font-mono text-rose-800 my-4">
                <AlertTriangle className="h-4 w-4 text-rose-600 mb-1" />
                Weather feed unavailable. Visual lookouts and manual pilotage procedures apply.
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-100 flex justify-between">
            <span>Forecast ID: {weather?.forecast_id || 'N/A'}</span>
            <span>Validity: 12 Hours</span>
          </div>
        </div>
      </div>

      {/* Constraints Grid: Port, Cargo, Crew, CMMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Port Constraints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <Anchor className="h-4 w-4 text-blue-600" /> Port & Berth
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {portConstraints.length} Notice(s)
            </span>
          </div>

          <div className="space-y-2.5">
            {portConstraints.map((pc, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-900">
                  <span className="font-bold">{pc.port_code}</span>
                  <span className={`font-semibold ${
                    pc.berth_state === 'CONGESTED' 
                      ? 'text-amber-700' 
                      : pc.berth_state === 'CLOSED' 
                      ? 'text-rose-700 font-bold' 
                      : 'text-emerald-700'
                  }`}>
                    {pc.berth_state}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{pc.text_excerpt}</div>
                <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between pt-1 border-t border-slate-200/60">
                  <span>Source: {pc.source}</span>
                  <span>Conf: {pc.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cargo Constraints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <Box className="h-4 w-4 text-blue-600" /> Cargo Manifest
            </span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold">
              {cargo?.priority} PRIORITY
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500">Charter Customer:</div>
              <div className="font-bold text-slate-900">{cargo?.customer_id}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Hazmat:</span>
                <div className={`font-bold ${cargo?.hazardous_goods === 'YES' ? 'text-rose-600' : 'text-slate-800'}`}>
                  {cargo?.hazardous_goods}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Reefer:</span>
                <div className={`font-bold flex items-center gap-1 ${cargo?.reefer_cargo === 'YES' ? 'text-blue-600' : 'text-slate-800'}`}>
                  {cargo?.reefer_cargo === 'YES' && <Snowflake className="h-3 w-3" />}
                  {cargo?.reefer_cargo}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              Delivery Window: {cargo?.delivery_window_utc.slice(5, 16).replace('T', ' ')}Z
            </div>
          </div>
        </div>

        {/* Crew Constraints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <Users className="h-4 w-4 text-blue-600" /> Crew & STCW Rest
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
              crew?.rest_hours_constraint === 'ACTIVE' 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {crew?.rest_hours_constraint === 'ACTIVE' ? 'REST ACTIVE' : 'OK'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500">Bridge Watch Team:</div>
              <div className="font-bold text-slate-900">{crew?.watch_team}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Master:</span>
                <div className="font-bold text-emerald-700">{crew?.master_available}</div>
              </div>
              <div>
                <span className="text-slate-500">Chief Eng:</span>
                <div className="font-bold text-emerald-700">{crew?.chief_engineer_available}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CMMS Maintenance Constraints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <Wrench className="h-4 w-4 text-blue-600" /> CMMS Condition
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                cmms?.condition === 'CRITICAL_HOLD'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {cmms?.condition || 'NORMAL'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500">Monitored Equipment:</div>
              <div className="font-bold text-slate-900">{cmms?.equipment}</div>
            </div>

            {cmms?.condition === 'CRITICAL_HOLD' ? (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-[11px] text-rose-800">
                <div>Work Order: <span className="font-bold text-rose-900">{cmms.work_order_id}</span></div>
                <div className="mt-0.5">Authorized Role: <span className="font-bold text-rose-900">{cmms.authorized_release_role}</span></div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                No active critical work orders or safety holds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
