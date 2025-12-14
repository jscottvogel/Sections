import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBases } from '../hooks/useKnowledgeBases';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Loader2, Plus, ArrowRight, Trash2 } from 'lucide-react';

export function Dashboard() {
    const { knowledgeBases, loading, createKnowledgeBase, deleteKnowledgeBase } = useKnowledgeBases();
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setIsCreating(true);
        try {
            await createKnowledgeBase(newTitle, 'My personal knowledge collection');
            setNewTitle('');
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Knowledge Bases</h2>
                    <p className="text-slate-500">Manage your collections of experience and skills.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                <Card className="border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-slate-600">Create New Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                placeholder="e.g., Main Resume 2025"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                disabled={isCreating}
                            />
                            <Button type="submit" className="w-full" disabled={!newTitle.trim() || isCreating}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Create New
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing KBs */}
                {knowledgeBases.map((kb) => (
                    <Card key={kb.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{kb.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-slate-500 line-clamp-2">
                                {kb.description || "No description provided."}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Last updated: {new Date(kb.updatedAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-slate-100 pt-4 mt-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteKnowledgeBase(kb.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/kb/${kb.id}`)}
                            >
                                View Sections <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
