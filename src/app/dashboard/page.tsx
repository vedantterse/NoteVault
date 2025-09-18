'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, LogOut, Crown, Building2, Users, FileText, Check, UserCheck } from 'lucide-react';

interface UserListItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, tenant, logout, updateTenant, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      loadNotes();
    }
  }, [user, authLoading, router]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNotes();
      if (response.success && response.data) {
        setNotes(response.data);
      } else {
        setError(response.error || 'Failed to load notes');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const response = await apiClient.createNote(newNote);
      if (response.success && response.data) {
        setNotes([response.data, ...notes]);
        setNewNote({ title: '', content: '' });
        setIsCreating(false);
        setError('');
      } else {
        if (response.error?.includes('SUBSCRIPTION_LIMIT')) {
          setError('Free plan limit reached! Upgrade to Pro for unlimited notes.');
        } else {
          setError(response.error || 'Failed to create note');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.title.trim()) return;

    try {
      const response = await apiClient.updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content
      });
      if (response.success && response.data) {
        setNotes(notes.map(note => 
          note.id === editingNote.id ? response.data! : note
        ));
        setEditingNote(null);
        setError('');
      } else {
        setError(response.error || 'Failed to update note');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await apiClient.deleteNote(id);
      if (response.success) {
        setNotes(notes.filter(note => note.id !== id));
        setError('');
      } else {
        setError(response.error || 'Failed to delete note');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    if (!tenant || user?.role !== 'admin') return;
    setShowPricingModal(false);
    setShowSuccessAnimation(true);

    // Simulate processing time
    setTimeout(async () => {
      try {
        const response = await apiClient.upgradeTenant(tenant.slug);
        if (response.success && response.data) {
          // Update the tenant data immediately without reloading
          updateTenant(response.data);
          setError(''); // Clear any existing errors
          setShowSuccessAnimation(false);
        } else {
          setError(response.error || 'Failed to upgrade subscription');
          setShowSuccessAnimation(false);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to upgrade subscription');
        setShowSuccessAnimation(false);
      }
    }, 2000);
  };

  const handleShowUsers = async () => {
    if (!user || user.role !== 'admin') return;
    
    setShowUsersModal(true);
    setUsersLoading(true);
    
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const canDeleteNote = (note: Note) => {
    // Admins can delete any note, users can only delete their own notes
    return user?.role === 'admin' || note.user_id === user?.id;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user || !tenant) return null;

  const showUpgradeButton = tenant.subscription_plan === 'free' && user.role === 'admin';
  const isAtLimit = tenant.subscription_plan === 'free' && notes.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-600/15 to-blue-600/15 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-500/15 to-orange-500/15 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Success Animation Modal */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border-2 border-emerald-400/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Upgrade Successful!</h3>
            <p className="text-gray-300 text-lg">Welcome to Pro plan ✨</p>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-md rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Team Members
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-center mt-2">
              Users in {tenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium truncate">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'outline'}
                          className={`text-xs ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-300 border-yellow-400/30' 
                              : 'border-gray-400/30 text-gray-400'
                          }`}
                        >
                          {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gray-700/50 w-fit mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-300">No users found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-md rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-center mt-2">
              Unlock unlimited potential for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                $29<span className="text-xl text-gray-400">/month</span>
              </div>
              <p className="text-gray-300">Perfect for growing teams</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-gray-200">Unlimited notes</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-gray-200">Unlimited team members</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-gray-200">Priority support</span>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold border-2 border-yellow-400/50 shadow-xl rounded-xl h-12"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note View Modal */}
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl">
          {viewingNote && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">{viewingNote.title}</DialogTitle>
                <DialogDescription className="text-gray-300 text-lg">
                  Created {new Date(viewingNote.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-lg p-4 rounded-xl bg-white/5 border border-white/10">
                  {viewingNote.content || 'No content available'}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
                {canDeleteNote(viewingNote) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingNote(null);
                      setEditingNote(viewingNote);
                    }}
                    className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDeleteNote(viewingNote) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const isOwnNote = viewingNote.user_id === user?.id;
                      const confirmMessage = isOwnNote 
                        ? 'Are you sure you want to delete this note?' 
                        : 'Are you sure you want to delete this note? (Admin action)';
                      if (confirm(confirmMessage)) {
                        handleDeleteNote(viewingNote.id);
                        setViewingNote(null);
                      }
                    }}
                    className="border-red-400/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Note Edit Modal */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-2xl rounded-3xl shadow-2xl">
          {editingNote && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Edit Note</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Make changes to your note
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <Input
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-12"
                  placeholder="Note title..."
                />
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 min-h-[200px] rounded-xl"
                  placeholder="Write your note content here..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setEditingNote(null)}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateNote}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl"
                >
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300 bg-purple-500/10">
                    {user.role}
                  </Badge>
                  {tenant.subscription_plan === 'pro' && (
                    <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 font-semibold">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-2 border-white/10">
                  <AvatarFallback className="text-sm text-white bg-transparent font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300 hidden sm:inline font-medium">
                  {user.email}
                </span>
              </div>
              
              {/* User Management Button (Admin Only) */}
              {user.role === 'admin' && (
                <Button
                  onClick={handleShowUsers}
                  variant="ghost"
                  size="sm"
                  className="p-3 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 transition-all duration-200 group"
                  title="Manage Users"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      <path d="M18 12c1.38 0 2.5-1.12 2.5-2.5S19.38 7 18 7s-2.5 1.12-2.5 2.5S16.62 12 18 12zm0 1.5c-1.83 0-5.5.92-5.5 2.75V18h11v-1.75c0-1.83-3.67-2.75-5.5-2.75z"/>
                    </svg>
                  </div>
                </Button>
              )}
              
              {showUpgradeButton && (
                <Button 
                  onClick={() => setShowPricingModal(true)} 
                  variant="outline" 
                  size="sm" 
                  className="border-2 border-yellow-400/50 text-yellow-200 hover:bg-yellow-500/10 hover:text-yellow-100 backdrop-blur-sm bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 shadow-xl rounded-xl font-semibold px-4"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              <Button onClick={logout} variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10 hover:text-white rounded-xl px-4">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 bg-red-500/10 backdrop-blur-xl border-red-400/30">
            <CardContent className="pt-6">
              <div className="text-red-200 text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl hover:shadow-3xl transition-all duration-300 group">
            <CardContent className="pt-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{notes.length}</p>
                  <p className="text-sm text-gray-300">
                    {tenant.subscription_plan === 'free' ? `/ 3 notes` : 'Total Notes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl hover:shadow-3xl transition-all duration-300 group">
            <CardContent className="pt-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/20 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{tenant.subscription_plan === 'free' ? 'Free' : 'Pro'}</p>
                  <p className="text-sm text-gray-300">Plan Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl hover:shadow-3xl transition-all duration-300 group">
            <CardContent className="pt-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1 capitalize">{user.role}</p>
                  <p className="text-sm text-gray-300">Your Role</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Note Section */}
        <div className="mb-10">
          {!isCreating ? (
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
              <CardContent className="pt-8">
                <Button 
                  onClick={() => setIsCreating(true)}
                  disabled={isAtLimit}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl rounded-2xl text-lg font-medium"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  {isAtLimit ? 'Upgrade to create more notes' : 'Create New Note'}
                </Button>
                {isAtLimit && !showUpgradeButton && (
                  <p className="text-sm text-gray-400 text-center mt-3">
                    Contact your admin to upgrade your plan
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Create New Note</CardTitle>
                <CardDescription className="text-gray-300">
                  Add a new note to your {tenant.name} workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  placeholder="Enter note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-12"
                />
                <Textarea
                  placeholder="Write your note content here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={5}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                />
                <div className="flex space-x-3">
                  <Button onClick={handleCreateNote} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl">
                    Create Note
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card 
                key={note.id} 
                className="h-fit bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group rounded-3xl"
                onClick={() => setViewingNote(note)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="line-clamp-1 text-white group-hover:text-blue-300 transition-colors duration-300 text-lg flex-1">{note.title}</CardTitle>
                    {note.user_id === user?.id && (
                      <Badge variant="outline" className="text-xs border-green-400/30 text-green-300 bg-green-500/10 ml-2">
                        Your Note
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    {new Date(note.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 line-clamp-3 mb-6 leading-relaxed">
                    {note.content || 'No content'}
                  </p>
                  <Separator className="mb-4 border-white/10" />
                  <div className="flex justify-end space-x-2">
                    {/* Only show edit button for own notes or if admin */}
                    {canDeleteNote(note) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note);
                        }}
                        className="text-gray-400 hover:bg-white/10 hover:text-white rounded-xl"
                        title="Edit note"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Only show delete button for deletable notes */}
                    {canDeleteNote(note) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          const isOwnNote = note.user_id === user?.id;
                          const confirmMessage = isOwnNote 
                            ? 'Are you sure you want to delete this note?' 
                            : 'Are you sure you want to delete this note? (Admin action)';
                          if (confirm(confirmMessage)) {
                            handleDeleteNote(note.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl"
                        title={user?.role === 'admin' && note.user_id !== user?.id ? 'Delete note (Admin)' : 'Delete note'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <div className="p-6 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm border border-white/10 w-fit mx-auto mb-6">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">No notes yet</h3>
                <p className="text-gray-300 mb-6 text-lg">
                  Create your first note to get started with your {tenant.name} workspace.
                </p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  disabled={isAtLimit}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl h-12 px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}