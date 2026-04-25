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
import { Eye, BookOpen, Clock, MessageSquare, Target, TrendingUp, Zap } from "lucide-react";

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
          <div key={i} className={`group relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-md ${stat.noPrint ? 'no-print' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-outline">{stat.label}</p>
                <h4 className="mt-1 font-headline text-2xl font-black text-primary">{stat.value}</h4>
                <p className="mt-0.5 font-body text-[11px] text-secondary">{stat.sub}</p>
              </div>
              <div className={`rounded-xl bg-surface-container-high p-2.5 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* CORE ANALYTICS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expertise Radar - The "Research Identity" */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center gap-2">
            <Target className="text-primary" size={18} />
            <h3 className="font-headline text-[15px] font-bold text-primary">Research Expertise DNA</h3>
          </div>
          <div className="h-[240px] w-full relative min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData && radarData.length > 0 ? radarData : [
                { subject: 'Research', A: 80, fullMark: 100 },
                { subject: 'Teaching', A: 70, fullMark: 100 },
                { subject: 'Innovation', A: 90, fullMark: 100 },
                { subject: 'Mentorship', A: 60, fullMark: 100 },
                { subject: 'Industry', A: 75, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} />
                <Radar name="Expertise" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Research Footprint - Type Distribution */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center gap-2">
            <Zap className="text-primary" size={18} />
            <h3 className="font-headline text-[15px] font-bold text-primary">Portfolio Footprint</h3>
          </div>
          <div className="h-[240px] w-full relative min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={footprintData && footprintData.length > 0 ? footprintData : [
                    { label: 'Journals', actualCount: 5, color: '#E8580A' },
                    { label: 'Conferences', actualCount: 3, color: '#2563EB' },
                    { label: 'Talks', actualCount: 2, color: '#16A34A' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="actualCount"
                  stroke="none"
                >
                  {(footprintData && footprintData.length > 0 ? footprintData : [
                    { color: '#E8580A' }, { color: '#2563EB' }, { color: '#16A34A' }
                  ]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {footprintData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-body text-[10px] font-medium text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Publication Output - Annual Success */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={18} />
            <h3 className="font-headline text-[15px] font-bold text-primary">Publication Output</h3>
          </div>
          <div className="h-[240px] w-full relative min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publicationOutputData && publicationOutputData.length > 0 ? publicationOutputData : [
                { year: '2020', count: 2 },
                { year: '2021', count: 4 },
                { year: '2022', count: 3 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH PERFORMANCE TREND */}
      <div className="rounded-2xl border border-outline-variant/20 bg-surface p-8 shadow-sm">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-headline text-[16px] font-bold text-primary">Career Performance Density</h3>
            <p className="font-body text-[12px] text-secondary">A multi-dimensional view of research and engagement growth</p>
          </div>
          <div className="flex flex-wrap gap-4 rounded-xl bg-surface-container-low px-4 py-2">
            {[
              { label: "Pubs", color: "#2563EB" },
              { label: "Talks", color: "#16A34A" },
              { label: "Awards", color: "#E8580A" }
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-4 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-outline">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="pubs" 
                stroke="#2563EB" 
                strokeWidth={4} 
                dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }} 
              />
              <Line 
                type="monotone" 
                dataKey="talks" 
                stroke="#16A34A" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#16A34A', strokeWidth: 2, stroke: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="awards" 
                stroke="#E8580A" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#E8580A', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
