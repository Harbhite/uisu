/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Users, Award, FileText, Megaphone, Loader2 } from 'lucide-react';
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
  upcoming: { label: 'Upcoming', color: 'bg-ui-blue', icon: Megaphone },
  anniversary: { label: 'Anniversary', color: 'bg-nobel-gold', icon: Award },
  election: { label: 'Election', color: 'bg-green-600', icon: Users },
  meeting: { label: 'Meeting', color: 'bg-purple-600', icon: FileText },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="container mx-auto px-6">
        {/* Back Navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Schedule</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9]">
              Events <br/> <span className="italic text-muted-foreground">Calendar</span>
            </h1>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['all', 'upcoming', 'anniversary', 'election', 'meeting'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all relative z-10 ${
                  activeFilter === filter 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                {activeFilter === filter && (
                  <motion.span 
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-ui-blue rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {filter === 'all' ? 'All Events' : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-full border border-border hover:border-nobel-gold hover:text-nobel-gold transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="font-serif text-2xl text-ui-blue">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-full border border-border hover:border-nobel-gold hover:text-nobel-gold transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square border-b border-r border-border bg-muted/30" />
                ))}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square border-b border-r border-border p-2 relative transition-colors ${
                        isSelected 
                          ? 'bg-ui-blue text-white' 
                          : isToday(day)
                            ? 'bg-nobel-gold/10'
                            : 'hover:bg-muted'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-white' : isToday(day) ? 'text-nobel-gold font-bold' : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      
                      {hasEvents && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div 
                              key={idx} 
                              className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[event.type].color}`} 
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Events */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8"
                >
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                    <Calendar size={14} />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>

                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDayEvents.map((event) => {
                        const config = eventTypeConfig[event.type];
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card border border-border p-6 relative overflow-hidden group hover:border-nobel-gold transition-colors"
                          >
                            <div className={`absolute left-0 top-0 h-full w-1 ${config.color}`} />
                            
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full ${config.color} text-white flex items-center justify-center shrink-0`}>
                                <config.icon size={18} />
                              </div>
                              
                              <div className="flex-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${config.color} text-white inline-block mb-2`}>
                                  {config.label}
                                </span>
                                <h4 className="font-serif text-xl text-ui-blue mb-2">{event.title}</h4>
                                <p className="text-muted-foreground font-light mb-4">{event.description}</p>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  {event.time && (
                                    <span className="flex items-center gap-2">
                                      <Clock size={14} className="text-nobel-gold" />
                                      {event.time}
                                    </span>
                                  )}
                                  {event.location && (
                                    <span className="flex items-center gap-2">
                                      <MapPin size={14} className="text-nobel-gold" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                                </div>
                              </div>
                              
                              {/* RSVP Section */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <EventRSVP
                                  eventId={event.id}
                                  eventTitle={event.title}
                                  eventDate={event.date}
                                  eventTime={event.time}
                                  eventLocation={event.location}
                                />
                              </div>
                            </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-card border border-border p-8 text-center">
                      <p className="text-muted-foreground font-light italic">No events scheduled for this day.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                <Calendar size={14} /> Upcoming Events
              </h3>

              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setCurrentMonth(event.date);
                      }}
                      className="w-full text-left p-4 bg-muted/50 border border-border rounded-lg hover:border-nobel-gold transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {format(event.date, 'MMM d')}
                        </span>
                      </div>
                      <h4 className="font-serif text-foreground group-hover:text-nobel-gold transition-colors">
                        {event.title}
                      </h4>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Legend</h3>
              <div className="space-y-3">
                {Object.entries(eventTypeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm text-foreground">{config.label}</span>
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