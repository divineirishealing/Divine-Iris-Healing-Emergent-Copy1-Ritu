import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { Pencil, Trash2, Plus, LogOut } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { resolveImageUrl } from '../../lib/imageUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ onLogout }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('programs');

  // State for data
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  // Form states
  const [programForm, setProgramForm] = useState({ 
    title: '', 
    category: '', 
    description: '', 
    image: '', 
    link: '/program',
    price_usd: 0,
    price_inr: 0,
    price_eur: 0,
    price_gbp: 0
  });
  const [sessionForm, setSessionForm] = useState({ 
    title: '', 
    description: '', 
    image: '',
    price_usd: 0,
    price_inr: 0,
    price_eur: 0,
    price_gbp: 0
  });
  const [testimonialForm, setTestimonialForm] = useState({ videoId: '' });
  const [editingId, setEditingId] = useState(null);

  // Load data
  useEffect(() => {
    loadPrograms();
    loadSessions();
    loadTestimonials();
    loadStats();
    loadSubscribers();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSubscribers = async () => {
    try {
      const response = await axios.get(`${API}/newsletter`);
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  // Programs CRUD
  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/programs/${editingId}`, programForm);
        toast({ title: 'Program updated successfully!' });
      } else {
        await axios.post(`${API}/programs`, programForm);
        toast({ title: 'Program created successfully!' });
      }
      setProgramForm({ title: '', category: '', description: '', image: '', link: '/program' });
      setEditingId(null);
      loadPrograms();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleProgramEdit = (program) => {
    setProgramForm(program);
    setEditingId(program.id);
  };

  const handleProgramDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`${API}/programs/${id}`);
        toast({ title: 'Program deleted successfully!' });
        loadPrograms();
      } catch (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  // Sessions CRUD
  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/sessions/${editingId}`, sessionForm);
        toast({ title: 'Session updated successfully!' });
      } else {
        await axios.post(`${API}/sessions`, sessionForm);
        toast({ title: 'Session created successfully!' });
      }
      setSessionForm({ title: '', description: '', image: '' });
      setEditingId(null);
      loadSessions();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSessionEdit = (session) => {
    setSessionForm(session);
    setEditingId(session.id);
  };

  const handleSessionDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`${API}/sessions/${id}`);
        toast({ title: 'Session deleted successfully!' });
        loadSessions();
      } catch (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  // Testimonials CRUD
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/testimonials`, testimonialForm);
      toast({ title: 'Testimonial added successfully!' });
      setTestimonialForm({ videoId: '' });
      loadTestimonials();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleTestimonialDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await axios.delete(`${API}/testimonials/${id}`);
        toast({ title: 'Testimonial deleted successfully!' });
        loadTestimonials();
      } catch (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleStatUpdate = async (stat, newValue, newLabel) => {
    try {
      await axios.put(`${API}/stats/${stat.id}`, { value: newValue, label: newLabel, order: stat.order });
      toast({ title: 'Stat updated successfully!' });
      loadStats();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Divine Iris Healing - Admin Panel</h1>
          <Button onClick={onLogout} variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="programs">Programs ({programs.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials ({testimonials.length})</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers ({subscribers.length})</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{editingId ? 'Edit Program' : 'Add New Program'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProgramSubmit} className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={programForm.title}
                      onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Category (e.g., Foundation, Body-Based)"
                      value={programForm.category}
                      onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Description"
                      value={programForm.description}
                      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                      required
                      rows={4}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Program Image *</label>
                      <div className="text-xs text-gray-600 mb-2">Choose one option below:</div>
                      
                      {/* Simple file input */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Upload from Computer:</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
                                e.target.value = '';
                                return;
                              }
                              
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              try {
                                toast({ title: 'Uploading...', description: 'Please wait' });
                                const response = await axios.post(`${API}/upload/image`, formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                const imageUrl = response.data.url;
                                setProgramForm({ ...programForm, image: imageUrl });
                                toast({ title: 'Success!', description: 'Image uploaded successfully' });
                                console.log('Image uploaded:', imageUrl);
                              } catch (error) {
                                console.error('Upload error:', error);
                                toast({ 
                                  title: 'Upload failed', 
                                  description: error.response?.data?.detail || 'Please try again',
                                  variant: 'destructive' 
                                });
                              }
                              e.target.value = '';
                            }}
                            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB - JPG, PNG, GIF, WebP</p>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">OR</div>
                      
                      {/* URL input */}
                      <Input
                        placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
                        value={programForm.image}
                        onChange={(e) => setProgramForm({ ...programForm, image: e.target.value })}
                      />
                      
                      {/* Image preview */}
                      {programForm.image && (
                        <div className="mt-2 relative">
                          <p className="text-xs text-gray-600 mb-1">Current Image:</p>
                          <img 
                            src={resolveImageUrl(programForm.image)} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded border-2 border-gray-300"
                            onError={(e) => {
                              console.error('Image failed to load:', programForm.image);
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setProgramForm({ ...programForm, image: '' })}
                            className="absolute top-8 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs hover:bg-red-600"
                          >
                            Remove
                          </button>
                          <p className="text-xs text-gray-500 mt-1 break-all">{programForm.image}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Plus size={18} className="mr-2" />
                        {editingId ? 'Update' : 'Add'} Program
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setProgramForm({ title: '', category: '', description: '', image: '', link: '/program' });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Programs</h3>
                {programs.map((program) => (
                  <Card key={program.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img src={resolveImageUrl(program.image)} alt={program.title} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{program.title}</h4>
                          <p className="text-sm text-gray-600">{program.category}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{program.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleProgramEdit(program)}>
                            <Pencil size={16} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleProgramDelete(program.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{editingId ? 'Edit Session' : 'Add New Session'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSessionSubmit} className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Description"
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                      required
                      rows={4}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Image *</label>
                      <div className="text-xs text-gray-600 mb-2">Choose one option below:</div>
                      
                      {/* Simple file input */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Upload from Computer:</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
                                e.target.value = '';
                                return;
                              }
                              
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              try {
                                toast({ title: 'Uploading...', description: 'Please wait' });
                                const response = await axios.post(`${API}/upload/image`, formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                const imageUrl = response.data.url;
                                setSessionForm({ ...sessionForm, image: imageUrl });
                                toast({ title: 'Success!', description: 'Image uploaded successfully' });
                                console.log('Image uploaded:', imageUrl);
                              } catch (error) {
                                console.error('Upload error:', error);
                                toast({ 
                                  title: 'Upload failed', 
                                  description: error.response?.data?.detail || 'Please try again',
                                  variant: 'destructive' 
                                });
                              }
                              e.target.value = '';
                            }}
                            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB - JPG, PNG, GIF, WebP</p>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">OR</div>
                      
                      {/* URL input */}
                      <Input
                        placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
                        value={sessionForm.image}
                        onChange={(e) => setSessionForm({ ...sessionForm, image: e.target.value })}
                      />
                      
                      {/* Image preview */}
                      {sessionForm.image && (
                        <div className="mt-2 relative">
                          <p className="text-xs text-gray-600 mb-1">Current Image:</p>
                          <img 
                            src={resolveImageUrl(sessionForm.image)} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded border-2 border-gray-300"
                            onError={(e) => {
                              console.error('Image failed to load:', sessionForm.image);
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setSessionForm({ ...sessionForm, image: '' })}
                            className="absolute top-8 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs hover:bg-red-600"
                          >
                            Remove
                          </button>
                          <p className="text-xs text-gray-500 mt-1 break-all">{sessionForm.image}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Plus size={18} className="mr-2" />
                        {editingId ? 'Update' : 'Add'} Session
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setSessionForm({ title: '', description: '', image: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Sessions</h3>
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img src={resolveImageUrl(session.image)} alt={session.title} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{session.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleSessionEdit(session)}>
                            <Pencil size={16} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleSessionDelete(session.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add YouTube Testimonial</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                    <Input
                      placeholder="YouTube Video ID (e.g., i3UJ6t6xYwQ)"
                      value={testimonialForm.videoId}
                      onChange={(e) => setTestimonialForm({ videoId: e.target.value })}
                      required
                    />
                    <p className="text-sm text-gray-600">Enter just the video ID from the YouTube URL</p>
                    <Button type="submit" className="w-full">
                      <Plus size={18} className="mr-2" />
                      Add Testimonial
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Testimonials</h3>
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img src={testimonial.thumbnail} alt="Testimonial" className="w-32 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-mono">{testimonial.videoId}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleTestimonialDelete(testimonial.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Website Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <StatEditor key={stat.id} stat={stat} onUpdate={handleStatUpdate} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>{subscriber.email}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatEditor = ({ stat, onUpdate }) => {
  const [value, setValue] = useState(stat.value);
  const [label, setLabel] = useState(stat.label);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(stat, value, label);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="flex-1">Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 mb-3">{stat.label}</div>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="w-full">
              <Pencil size={14} className="mr-2" />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0, total_sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API}/payments/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/payments/transactions/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ${stats.total_revenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {stats.total_sales}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Date</th>
                    <th className="text-left p-3 text-sm font-semibold">Customer</th>
                    <th className="text-left p-3 text-sm font-semibold">Item</th>
                    <th className="text-left p-3 text-sm font-semibold">Amount</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">
                        <div>{transaction.customer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{transaction.customer_email}</div>
                      </td>
                      <td className="p-3 text-sm">{transaction.item_title}</td>
                      <td className="p-3 text-sm font-semibold">
                        {transaction.currency.toUpperCase()} {transaction.amount}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
