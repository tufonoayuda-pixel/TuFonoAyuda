
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isSameDay, startOfDay, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Session } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { SessionDetailModal } from './session-detail-modal';
import { sessions as initialSessions } from '@/lib/mock-data';

export function AgendaClient() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedDaySessions = useMemo(() => {
    if (!date || !isClient) return [];
    const startOfSelectedDay = startOfDay(date);
    return sessions
      .filter((session) => isSameDay(new Date(session.date), startOfSelectedDay))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, date, isClient]);

  const handleSessionUpdate = useCallback((updatedSession: Session) => {
    setSessions(prevSessions => 
      prevSessions.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
  }, []);

  const handleDateSelect = useCallback((selectedDate: Date) => {
    setDate(selectedDate);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setDate(today);
    setViewDate(today);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedSession(null);
  }, []);

  const getStatusVariant = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'programada': return 'secondary';
      case 'confirmada': return 'default';
      case 'cancelada': return 'destructive';
      case 'completada': return 'outline';
      case 'ausente': return 'destructive';
      default: return 'outline';
    }
  }, []);

  const formatSelectedDate = useCallback(() => {
    if (!isClient || !date) return 'Cargando...';
    try {
      return format(date, "d 'de' MMMM", { locale: es });
    } catch (error) {
      return 'Seleccione un día';
    }
  }, [date, isClient]);

  const calendarDays = useMemo(() => {
    if (!isClient) return [];
    
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  }, [viewDate, isClient]);

  const goToPreviousMonth = useCallback(() => {
    setViewDate(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDate(prev => addMonths(prev, 1));
  }, []);

  const getSessionsForDay = useCallback((day: Date) => {
    const startOfGivenDay = startOfDay(day);
    return sessions.filter(session => isSameDay(new Date(session.date), startOfGivenDay));
  }, [sessions]);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg animate-pulse">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Cargando...</h2>
          <Card className="min-h-[400px]">
            <CardContent className="p-4 space-y-4">
              <div className="text-center text-muted-foreground pt-16 animate-pulse">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Cargando agenda...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <h2 className="text-lg font-semibold capitalize">{format(viewDate, 'MMMM yyyy', { locale: es })}</h2>
                <Button variant="outline" size="icon" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const daySessions = getSessionsForDay(day);
                  const isCurrentMonth = isSameMonth(day, viewDate);
                  const isSelected = date && isSameDay(day, date);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateSelect(day)}
                      className={`relative h-20 w-full text-sm transition-colors rounded-md p-2 flex flex-col items-start ${isCurrentMonth ? 'text-foreground hover:bg-accent hover:text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} ${isToday(day) ? 'bg-primary text-primary-foreground font-bold' : ''} ${isSelected && !isToday(day) ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      <span>{format(day, 'd')}</span>
                      {daySessions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {daySessions.slice(0, 3).map((session, idx) => (
                            <div key={`${session.id}-${idx}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: session.color }} />
                          ))}
                          {daySessions.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold capitalize">{formatSelectedDate()}</h2>
            <Button size="sm" variant="outline" onClick={goToToday}>Hoy</Button>
          </div>
          <Card className="min-h-[400px]">
            <CardContent className="p-4 space-y-4">
              {selectedDaySessions.length > 0 ? (
                selectedDaySessions.map((session) => (
                  <button key={session.id} className="w-full text-left p-3 rounded-lg border-l-4 hover:bg-secondary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20" style={{ borderColor: session.color }} onClick={() => setSelectedSession(session)}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-foreground">{session.patientName}</p>
                      <span className="text-xs text-muted-foreground">{session.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{session.type}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusVariant(session.status)} className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.status}</Badge>
                      {session.duration && <span className="text-xs text-muted-foreground">{session.duration} min</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-muted-foreground pt-16">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">{date && isToday(date) ? 'No hay sesiones programadas para hoy.' : 'No hay sesiones programadas para este día.'}</p>
                </div>
              )}
              <Button asChild className="w-full mt-4" size="lg">
                <Link href="/agenda/nueva-cita"><Plus className="mr-2 h-4 w-4" />Nueva Cita</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {selectedSession && <SessionDetailModal session={selectedSession} isOpen={!!selectedSession} onClose={closeModal} onUpdate={handleSessionUpdate} />}
    </>
  );
}
