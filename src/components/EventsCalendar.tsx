/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Users, Award, FileText, Megaphone, Loader2, Filter, Share2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { EventRSVP } from "@/components/EventRSVP";

interface EventsCalendarProps {
  onBack: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'upcoming' | 'anniversary' | 'election' | 'meeting';
  description: string;
  location?: string;
  time?: string;
}

const eventTypeConfig = {
  upcoming: { label: 'Upcoming', color: 'bg-ui-blue', icon: Megaphone, text: 'text-ui-blue', border: 'border-ui-blue' },
  anniversary: { label: 'Anniversary', color: 'bg-nobel-gold', icon: Award, text: 'text-nobel-gold', border: 'border-nobel-gold' },
  election: { label: 'Election', color: 'bg-green-600', icon: Users, text: 'text-green-600', border: 'border-green-600' },
  meeting: { label: 'Meeting', color: 'bg-purple-600', icon: FileText, text: 'text-purple-600', border: 'border-purple-600' },
};

export const EventsCalendar: React.FC<EventsCalendarProps> = ({ onBack }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });
        
        if (error) throw error;
        
        const formattedEvents: CalendarEvent[] = (data || []).map(event => ({
          id: event.id,
          title: event.title,
          date: parseISO(event.event_date),
          type: event.event_type as CalendarEvent['type'],
          description: event.description || '',
          location: event.location || undefined,
          time: event.event_time || undefined,
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    return event.type === activeFilter;
  });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const upcomingEvents = filteredEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Back Navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8 md:mb-12"
        >
          <div className="p-2 border border-slate-200 group-hover:border-nobel-gold transition-colors bg-white">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        {/* Header - Simple & Sleek */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 md:mb-20 gap-8 md:gap-12 border-b border-slate-200 pb-8 md:pb-12">
          <div>
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <Calendar className="text-nobel-gold w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-slate-400">Official Schedule</span>
            </div>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif text-ui-blue leading-[0.9] tracking-tight">
              Events <br/> <span className="italic text-slate-300">Registry</span>
            </h1>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['all', 'upcoming', 'anniversary', 'election', 'meeting'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 md:px-6 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  activeFilter === filter 
                    ? 'bg-ui-blue text-white border-ui-blue shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-nobel-gold hover:text-ui-blue'
                }`}
              >
                {filter === 'all' ? 'All' : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Calendar Grid - Matrix Style */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 shadow-sm">
              {/* Month Navigation */}
              <div className="flex items-center justify-between p-4 md:p-8 border-b border-slate-200 bg-slate-50/30">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 md:p-3 bg-white border border-slate-200 hover:border-nobel-gold hover:text-nobel-gold transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">Archive Timeline</span>
                  <h2 className="font-serif text-xl md:text-3xl text-ui-blue italic">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                </div>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 md:p-3 bg-white border border-slate-200 hover:border-nobel-gold hover:text-nobel-gold transition-colors shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="p-2 md:p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-r border-slate-100 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 bg-slate-100 gap-px border-b border-slate-200">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square bg-slate-50/30" />
                ))}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvents = dayEvents.length > 0;
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square relative transition-all group p-1 md:p-2 flex flex-col items-center md:items-start justify-between ${
                        isSelected 
                          ? 'bg-ui-blue text-white ring-2 ring-ui-blue z-10'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-mono text-xs md:text-sm ${
                        isSelected ? 'text-nobel-gold' : isCurrentDay ? 'text-ui-blue font-bold' : 'text-slate-400 group-hover:text-ui-blue'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      
                      {hasEvents && (
                        <div className="w-full flex justify-center md:justify-start gap-0.5 md:gap-1 mt-auto">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div 
                              key={idx} 
                              className={`w-1 h-1 md:w-auto md:flex-1 md:h-1 rounded-full md:rounded-none ${eventTypeConfig[event.type].color}`}
                            />
                          ))}
                        </div>
                      )}

                      {isCurrentDay && !isSelected && (
                         <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1 h-1 md:w-1.5 md:h-1.5 bg-nobel-gold rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 md:p-4 bg-slate-50 flex flex-wrap justify-end gap-3 md:gap-6 text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-ui-blue"></div> Upcoming</span>
                <span className="flex items-center gap-1.5 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-nobel-gold"></div> Anniversary</span>
                <span className="flex items-center gap-1.5 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-600"></div> Election</span>
              </div>
            </div>

            {/* Selected Day Events - Archival Dossier Style */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 md:mt-12"
                >
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Calendar size={14} className="text-nobel-gold" />
                      Entry: {format(selectedDate, 'MM.dd.yyyy')}
                    </h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-4 md:space-y-6">
                      {selectedDayEvents.map((event) => {
                        const config = eventTypeConfig[event.type];
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-white border border-slate-200 border-l-4 ${config.border} p-6 md:p-8 shadow-sm group hover:shadow-md transition-shadow`}
                          >
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 md:px-3 md:py-1 bg-slate-100 ${config.text}`}>
                                    {config.label}
                                  </span>
                                  {event.time && (
                                    <span className="text-[8px] md:text-[9px] font-mono text-slate-400 flex items-center gap-1">
                                      <Clock size={10} /> {event.time}
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-serif text-xl md:text-2xl text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">
                                  {event.title}
                                </h4>

                                <p className="text-slate-500 font-light text-xs md:text-sm leading-relaxed mb-6 border-l-2 border-slate-100 pl-4">
                                  {event.description}
                                </p>

                                {event.location && (
                                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                                    <MapPin size={12} className="text-nobel-gold" />
                                    {event.location}
                                  </div>
                                )}

                                <div className="pt-6 border-t border-slate-100">
                                  <EventRSVP
                                    eventId={event.id}
                                    eventTitle={event.title}
                                    eventDate={event.date}
                                    eventTime={event.time}
                                    eventLocation={event.location}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed p-8 md:p-12 text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                        <FileText size={20} />
                      </div>
                      <p className="text-slate-400 font-serif italic text-sm md:text-base">No records found for this date.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Bold Schedule Style */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-ui-blue p-4 md:p-6">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 block mb-1">Official Schedule</span>
                <h3 className="text-2xl md:text-3xl font-serif italic text-white leading-tight">
                  Upcoming<br/>Dispatch
                </h3>
              </div>

              {/* Events List */}
              <div className="divide-y-0">
                {upcomingEvents.map((event, index) => {
                  const config = eventTypeConfig[event.type];
                  const bgColors = ['bg-ui-blue', 'bg-nobel-gold', 'bg-green-600', 'bg-purple-600', 'bg-orange-500'];
                  const bgColor = bgColors[index % bgColors.length];
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setCurrentMonth(event.date);
                      }}
                      className={`w-full text-left ${bgColor} p-4 md:p-5 hover:brightness-110 transition-all group border-b-2 border-white/10 last:border-b-0`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time/Date Column */}
                        <div className="flex flex-col items-start min-w-[70px] md:min-w-[80px]">
                          <span className="text-white/70 text-[10px] font-bold uppercase tracking-wide mb-0.5">
                            {format(event.date, 'MMM dd')}
                          </span>
                          <span className="text-xl md:text-2xl font-bold text-white leading-none">
                            {event.time || format(event.date, 'yyyy')}
                          </span>
                        </div>
                        
                        {/* Content Column */}
                        <div className="flex-1 border-l-2 border-white/20 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-white rotate-45"></div>
                          </div>
                          <h4 className="font-bold text-white text-sm md:text-base leading-tight mb-1 group-hover:underline underline-offset-2">
                            {event.title}
                          </h4>
                          <p className="text-white/70 text-[10px] md:text-xs leading-relaxed line-clamp-2">
                            {event.description || `${config.label} event scheduled`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {upcomingEvents.length === 0 && (
                  <div className="p-8 text-center bg-slate-50">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-xs italic">No upcoming events scheduled.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-900 p-4 flex items-center justify-between">
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {upcomingEvents.length} Event{upcomingEvents.length !== 1 ? 's' : ''} Queued
                </span>
                <button className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-nobel-gold hover:text-white transition-colors">
                  View All →
                </button>
              </div>
            </div>

            {/* Protocol Legend */}
            <div className="bg-slate-900 text-white p-6 md:p-8 border-l-4 border-nobel-gold shadow-xl hidden md:block">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Share2 size={14} className="text-nobel-gold" /> Protocol Legend
              </h3>
              <div className="space-y-4">
                {Object.entries(eventTypeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between group cursor-default">
                    <span className="text-sm font-light text-slate-300 group-hover:text-white transition-colors">{config.label}</span>
                    <div className={`w-2 h-2 ${config.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
