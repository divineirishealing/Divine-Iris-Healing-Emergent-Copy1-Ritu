import React, { useState } from 'react';
import { sessions } from '../mockData';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const SessionsSection = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState(sessions[0]?.title);

  return (
    <section id="sessions" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">
          Book Personal Session
        </h2>

        {/* Tab Navigation */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveTab(session.title)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeTab === session.title
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>

        {/* Session Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0"
              onClick={() => setSelectedSession(session)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={session.image}
                  alt={session.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {session.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {session.description}
                </p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">
                  {selectedSession.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={selectedSession.image}
                  alt={selectedSession.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <DialogDescription className="text-gray-700 leading-relaxed text-base">
                  {selectedSession.description}
                </DialogDescription>
                <div className="mt-8 flex gap-4">
                  <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Book Session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSession(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SessionsSection;
