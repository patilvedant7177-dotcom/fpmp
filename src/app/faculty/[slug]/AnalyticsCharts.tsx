"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Eye, BookOpen, Clock, MessageSquare, Target, TrendingUp, Zap, Sparkles } from "lucide-react";

interface AnalyticsChartsProps {
  impactMetrics: {
    views: number;
    publications: number;
    experience: string;
    inquiries: number;
  };
  footprintData: any[];
  publicationOutputData: any[];
  activityData: any[];
  radarData: any[];
}

export default function AnalyticsCharts({
  impactMetrics,
  footprintData,
  publicationOutputData,
  activityData,
  radarData,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* KPI HEADER BAR */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Reach", value: impactMetrics.views, icon: Eye, color: "blue", sub: "Profile Views" },
          { label: "Output", value: impactMetrics.publications, icon: BookOpen, color: "indigo", sub: "Publications" },
          { label: "Tenure", value: impactMetrics.experience, icon: Clock, color: "amber", sub: "Experience" },
          { label: "Engage", value: impactMetrics.inquiries, icon: MessageSquare, color: "emerald", sub: "Inquiries", noPrint: true },
        ].map((stat: any, i) => (
          <div key={i} className={`group relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-md md:p-5 ${stat.noPrint ? 'no-print' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-label text-[9px] font-bold uppercase tracking-widest text-outline md:text-[10px]">{stat.label}</p>
                <h4 className="mt-1 font-headline text-xl font-black text-primary md:text-2xl">{stat.value}</h4>
                <p className="mt-0.5 font-body text-[10px] text-secondary md:text-[11px]">{stat.sub}</p>
              </div>
              <div className={`rounded-xl bg-surface-container-high p-2 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors md:p-2.5`}>
                <stat.icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* CORE ANALYTICS GRID */}
      {(() => {
        const totalFootprint = footprintData?.reduce((acc, curr) => acc + (curr.actualCount || 0), 0) || 0;
        const hasPubData = publicationOutputData && publicationOutputData.length > 0;
        
        let colsClass = "lg:grid-cols-1";
        if (totalFootprint > 0 && hasPubData) colsClass = "lg:grid-cols-3";
        else if (totalFootprint > 0 || hasPubData) colsClass = "lg:grid-cols-2";

        return (
          <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
        {/* Expertise Radar - The "Research Identity" */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center gap-2 md:mb-6">
            <Target className="text-primary h-4 w-4 md:h-[18px] md:w-[18px]" />
            <h3 className="font-headline text-lg font-extrabold text-primary md:text-[20px]">Research Expertise DNA</h3>
          </div>
          <div className="h-[240px] w-full relative min-h-[240px] md:h-[260px] md:min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="60%" 
                margin={{ top: 0, right: 30, bottom: 0, left: 30 }}
                data={radarData && radarData.length > 0 ? radarData : [
                { subject: 'Research', A: 80, fullMark: 100 },
                { subject: 'Teaching', A: 70, fullMark: 100 },
                { subject: 'Innovation', A: 90, fullMark: 100 },
                { subject: 'Mentorship', A: 60, fullMark: 100 },
                { subject: 'Industry', A: 75, fullMark: 100 },
              ]}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
                  </linearGradient>
                  <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tickFormatter={(t) => t.toUpperCase()}
                  tick={{ 
                    fontSize: 8, 
                    fill: '#475569', 
                    fontWeight: 700
                  }} 
                />
                <Radar 
                  name="Expertise" 
                  dataKey="A" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fill="url(#radarGradient)" 
                  fillOpacity={0.8}
                  style={{ filter: 'url(#radarShadow)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 border border-primary/10">
              <Sparkles className="text-primary h-2.5 w-2.5 md:h-3 md:w-3" />
              <span className="font-label text-[9px] font-bold uppercase tracking-wider text-primary">Academic Identity Map</span>
            </div>
          </div>
        </div>

        {/* Research Footprint - Type Distribution */}
        {totalFootprint > 0 && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center gap-2 md:mb-6">
              <Zap className="text-primary h-4 w-4 md:h-[18px] md:w-[18px]" />
              <h3 className="font-headline text-lg font-extrabold text-primary md:text-[20px]">Portfolio Footprint</h3>
            </div>
            <div className="h-[260px] w-full relative min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="0" dy="2" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={footprintData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="actualCount"
                    stroke="none"
                    style={{ filter: 'url(#pieShadow)' }}
                  >
                    {footprintData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10px] md:translate-y-[-10px]">
                <span className="font-headline text-xl font-black text-primary leading-none md:text-[24px]">
                  {totalFootprint}
                </span>
                <span className="font-label text-[9px] font-bold uppercase tracking-widest text-outline md:text-[10px]">Total</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {footprintData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant/10">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-body text-[10px] font-bold text-secondary uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publication Output - Annual Success */}
        {hasPubData && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center gap-2 md:mb-6">
              <TrendingUp className="text-primary h-4 w-4 md:h-[18px] md:w-[18px]" />
              <h3 className="font-headline text-lg font-extrabold text-primary md:text-[20px]">Publication Output</h3>
            </div>
            <div className="h-[260px] w-full relative min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publicationOutputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      );
      })()}

      {/* FULL-WIDTH PERFORMANCE TREND */}
      {activityData && activityData.length > 0 && (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={120} strokeWidth={0.5} className="text-primary" />
          </div>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center relative z-10">
            <div>
              <h3 className="font-headline text-lg font-extrabold text-primary md:text-[22px]">Career Performance Density</h3>
              <p className="font-body text-[11px] text-secondary md:text-[12px]">A multi-dimensional view of research and engagement growth</p>
            </div>
            <div className="flex flex-wrap gap-4 rounded-xl bg-surface-container-low px-4 py-2 border border-outline-variant/10">
              {[
                { label: "Publications", color: "#2563EB" },
                { label: "Talks", color: "#16A34A" },
                { label: "Awards", color: "#E8580A" }
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-4 rounded-full shadow-sm" style={{ backgroundColor: l.color }} />
                  <span className="font-label text-[10px] font-bold uppercase tracking-wider text-outline">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTalks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAwards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8580A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#E8580A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pubs" 
                  stroke="#2563EB" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="talks" 
                  stroke="#16A34A" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#16A34A', strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={2000}
                />
                <Line 
                  type="monotone" 
                  dataKey="awards" 
                  stroke="#E8580A" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#E8580A', strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={2500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
