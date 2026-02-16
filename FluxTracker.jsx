import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Grid3x3, List, BarChart3, Trash2, Check, Clock, AlertCircle, X, Download, Moon, Sun, Zap, Sparkles, History, Key, Timer, Edit2, Save, TrendingUp, DollarSign, AlertTriangle, Link2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PRIORITIES = {
  high: { label: 'Haute', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: '🔴', weight: 3 },
  medium: { label: 'Moyenne', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: '🟠', weight: 2 },
  low: { label: 'Basse', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '🔵', weight: 1 }
};

const STATUSES = {
  todo: { label: 'À faire', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Clock },
  inProgress: { label: 'En cours', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertCircle },
  done: { label: 'Terminé', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: Check }
};

const TEMPLATES = {
  migration: {
    name: '🗃️ Migration Base de Données',
    items: [
      { object: 'Audit de la BDD', action: 'Analyser la structure actuelle et identifier les dépendances', priority: 'high', estimatedHours: 8, budget: 2000 },
      { object: 'Plan de migration', action: 'Définir la stratégie et le calendrier de migration', priority: 'high', estimatedHours: 16, budget: 4000 },
      { object: 'Environnement de test', action: 'Configurer un environnement miroir pour les tests', priority: 'medium', estimatedHours: 12, budget: 3000 },
      { object: 'Scripts de migration', action: 'Développer et tester les scripts de transfert de données', priority: 'high', estimatedHours: 24, budget: 6000 },
      { object: 'Migration pilote', action: 'Effectuer une migration test sur un échantillon', priority: 'medium', estimatedHours: 8, budget: 2000 },
      { object: 'Documentation', action: 'Rédiger la procédure de rollback et FAQ', priority: 'low', estimatedHours: 4, budget: 1000 }
    ]
  },
  security: {
    name: '🔒 Audit de Sécurité',
    items: [
      { object: 'Scan de vulnérabilités', action: 'Lancer un scan automatisé sur tous les endpoints', priority: 'high', estimatedHours: 4, budget: 1500 },
      { object: 'Revue du code', action: 'Analyser le code pour détecter les failles de sécurité', priority: 'high', estimatedHours: 16, budget: 5000 },
      { object: 'Test de pénétration', action: 'Effectuer des tests d\'intrusion contrôlés', priority: 'high', estimatedHours: 24, budget: 8000 },
      { object: 'Mise à jour dépendances', action: 'Corriger les packages avec vulnérabilités connues', priority: 'medium', estimatedHours: 8, budget: 2000 },
      { object: 'Rapport d\'audit', action: 'Compiler les résultats et recommandations', priority: 'medium', estimatedHours: 8, budget: 2000 }
    ]
  }
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in z-50 flex items-center gap-3`}>
      <Sparkles className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default function FluxTrackerPro() {
  const [view, setView] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showRisks, setShowRisks] = useState(false);
  const [toast, setToast] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('fluxtracker-items');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        object: 'Migration Base de Données',
        action: 'Planifier et exécuter la migration PostgreSQL',
        responsible: 'Sophie Martin',
        priority: 'high',
        status: 'inProgress',
        createdAt: new Date('2025-02-10'),
        timeSpent: 0,
        estimatedHours: 24,
        budget: 6000,
        dependencies: []
      },
      {
        id: 2,
        object: 'Documentation API',
        action: 'Rédiger la documentation technique complète',
        responsible: 'Marc Dubois',
        priority: 'medium',
        status: 'todo',
        createdAt: new Date('2025-02-12'),
        timeSpent: 0,
        estimatedHours: 16,
        budget: 4000,
        dependencies: [1]
      },
      {
        id: 3,
        object: 'Tests de Performance',
        action: 'Effectuer les tests de charge sur l\'environnement de staging',
        responsible: 'Julie Leroy',
        priority: 'high',
        status: 'done',
        createdAt: new Date('2025-02-08'),
        timeSpent: 3600,
        estimatedHours: 8,
        budget: 2000,
        dependencies: []
      }
    ];
  });

  const [risks, setRisks] = useState(() => {
    const saved = localStorage.getItem('fluxtracker-risks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Retard migration', impact: 'high', probability: 'medium', mitigation: 'Prévoir 20% de temps supplémentaire' },
      { id: 2, title: 'Dépassement budget', impact: 'medium', probability: 'low', mitigation: 'Validation des coûts hebdomadaire' }
    ];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('fluxtracker-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItem, setNewItem] = useState({
    object: '',
    action: '',
    responsible: '',
    priority: 'medium',
    status: 'todo',
    estimatedHours: 0,
    budget: 0
  });

  useEffect(() => {
    localStorage.setItem('fluxtracker-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('fluxtracker-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('fluxtracker-risks', JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'n':
            e.preventDefault();
            setShowNewItemForm(true);
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(true);
            break;
        }
      }
      if (!showNewItemForm && !showShortcuts && !editingItem) {
        switch(e.key) {
          case '1':
            setView('kanban');
            break;
          case '2':
            setView('list');
            break;
          case '3':
            setView('stats');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showNewItemForm, showShortcuts, editingItem]);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setItems(prev => prev.map(item => 
          item.id === activeTimer 
            ? { ...item, timeSpent: (item.timeSpent || 0) + 1 }
            : item
        ));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const addToHistory = (action, details) => {
    const entry = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date()
    };
    setHistory(prev => [entry, ...prev].slice(0, 50));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsible.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [items, searchTerm, filterPriority, filterStatus]);

  const stats = useMemo(() => {
    const total = items.length;
    const todo = items.filter(i => i.status === 'todo').length;
    const inProgress = items.filter(i => i.status === 'inProgress').length;
    const done = items.filter(i => i.status === 'done').length;
    const highPriority = items.filter(i => i.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const totalTimeSpent = items.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
    const totalBudget = items.reduce((acc, item) => acc + (item.budget || 0), 0);
    const totalEstimatedHours = items.reduce((acc, item) => acc + (item.estimatedHours || 0), 0);
    
    return { total, todo, inProgress, done, highPriority, completionRate, totalTimeSpent, totalBudget, totalEstimatedHours };
  }, [items]);

  const aiSuggestions = useMemo(() => {
    const suggestions = [];
    
    const workload = {};
    items.forEach(item => {
      if (item.status !== 'done') {
        workload[item.responsible] = (workload[item.responsible] || 0) + PRIORITIES[item.priority].weight;
      }
    });
    
    const maxLoad = Math.max(...Object.values(workload));
    const overloaded = Object.entries(workload).filter(([_, load]) => load >= maxLoad && maxLoad > 5);
    
    if (overloaded.length > 0) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Charge de travail déséquilibrée',
        description: `${overloaded.map(([name]) => name).join(', ')} ${overloaded.length > 1 ? 'ont' : 'a'} une charge importante. Envisagez de redistribuer certaines tâches.`
      });
    }

    const stuck = items.filter(i => {
      if (i.status !== 'inProgress') return false;
      const daysSince = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 7;
    });
    
    if (stuck.length > 0) {
      suggestions.push({
        type: 'info',
        icon: '🔄',
        title: `${stuck.length} tâche${stuck.length > 1 ? 's' : ''} en cours depuis +7 jours`,
        description: 'Ces tâches pourraient nécessiter une attention particulière ou être bloquées.'
      });
    }

    const blockedByDeps = items.filter(item => {
      if (item.status === 'done') return false;
      return item.dependencies?.some(depId => {
        const dep = items.find(i => i.id === depId);
        return dep && dep.status !== 'done';
      });
    });

    if (blockedByDeps.length > 0) {
      suggestions.push({
        type: 'warning',
        icon: '🔗',
        title: `${blockedByDeps.length} tâche${blockedByDeps.length > 1 ? 's' : ''} bloquée${blockedByDeps.length > 1 ? 's' : ''} par dépendances`,
        description: 'Certaines tâches attendent que d\'autres soient terminées.'
      });
    }

    const budgetOverrun = items.filter(i => {
      const hourlyRate = 250;
      const actualCost = (i.timeSpent / 3600) * hourlyRate;
      return actualCost > (i.budget || 0) * 0.9;
    });

    if (budgetOverrun.length > 0) {
      suggestions.push({
        type: 'warning',
        icon: '💰',
        title: 'Risque de dépassement budgétaire',
        description: `${budgetOverrun.length} tâche${budgetOverrun.length > 1 ? 's' : ''} approche${budgetOverrun.length > 1 ? 'nt' : ''} ou dépasse${budgetOverrun.length > 1 ? 'nt' : ''} le budget.`
      });
    }

    if (stats.highPriority > stats.todo + stats.inProgress) {
      suggestions.push({
        type: 'success',
        icon: '✨',
        title: 'Bonne gestion des priorités',
        description: 'La plupart des tâches haute priorité sont terminées ou en cours.'
      });
    }

    const recentDone = items.filter(i => {
      const daysSince = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return i.status === 'done' && daysSince <= 3;
    });
    
    if (recentDone.length >= 3) {
      suggestions.push({
        type: 'success',
        icon: '🔥',
        title: 'Excellente productivité !',
        description: `${recentDone.length} tâches terminées ces 3 derniers jours. L'équipe est en forme !`
      });
    }

    return suggestions;
  }, [items, stats]);

  const addItem = () => {
    if (newItem.object && newItem.action && newItem.responsible) {
      const item = {
        ...newItem,
        id: Date.now(),
        createdAt: new Date(),
        timeSpent: 0,
        dependencies: []
      };
      setItems([...items, item]);
      addToHistory('Création', `Tâche "${item.object}" créée`);
      setNewItem({
        object: '',
        action: '',
        responsible: '',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 0,
        budget: 0
      });
      setShowNewItemForm(false);
      showToast('✅ Tâche créée avec succès');
    }
  };

  const deleteItem = (id) => {
    const item = items.find(i => i.id === id);
    setItems(items.filter(item => item.id !== id));
    addToHistory('Suppression', `Tâche "${item?.object}" supprimée`);
    showToast('🗑️ Tâche supprimée');
  };

  const updateItemStatus = (id, newStatus) => {
    const item = items.find(i => i.id === id);
    setItems(items.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    addToHistory('Mise à jour', `"${item?.object}" → ${STATUSES[newStatus].label}`);
    showToast(`📊 Statut mis à jour: ${STATUSES[newStatus].label}`);
  };

  const startEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const saveEditItem = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      addToHistory('Modification', `Tâche "${editingItem.object}" modifiée`);
      setEditingItem(null);
      showToast('✅ Modifications enregistrées');
    }
  };

  const cancelEditItem = () => {
    setEditingItem(null);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (draggedItem) {
      updateItemStatus(draggedItem.id, status);
      setDraggedItem(null);
    }
  };

  const toggleTimer = (id) => {
    if (activeTimer === id) {
      setActiveTimer(null);
      showToast('⏸️ Chronomètre arrêté');
    } else {
      setActiveTimer(id);
      showToast('▶️ Chronomètre démarré');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    const newItems = template.items.map((item, index) => ({
      ...item,
      id: Date.now() + index,
      responsible: 'À assigner',
      status: 'todo',
      createdAt: new Date(),
      timeSpent: 0,
      dependencies: []
    }));
    setItems([...items, ...newItems]);
    addToHistory('Template', `Projet "${template.name}" créé avec ${newItems.length} tâches`);
    setShowTemplates(false);
    showToast(`🎯 Template "${template.name}" appliqué`);
  };

  const exportToPDF = async () => {
    showToast('📄 Génération du PDF en cours...', 'info');
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Import autoTable functionality
      const autoTable = (await import('jspdf-autotable')).default;
      
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FluxTracker Pro', 15, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport de Projet', 15, 30);
      
      const date = new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(date, pageWidth - 15, 30, { align: 'right' });
      
      // Statistics section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('📊 Statistiques Globales', 15, 55);
      
      const statsData = [
        ['Total des tâches', stats.total.toString()],
        ['Tâches à faire', stats.todo.toString()],
        ['Tâches en cours', stats.inProgress.toString()],
        ['Tâches terminées', stats.done.toString()],
        ['Taux de complétion', `${stats.completionRate}%`],
        ['Temps total investi', formatTime(stats.totalTimeSpent)],
        ['Budget total', `${stats.totalBudget.toLocaleString('fr-FR')} €`],
        ['Heures estimées', `${stats.totalEstimatedHours}h`]
      ];
      
      autoTable(doc, {
        startY: 65,
        head: [['Métrique', 'Valeur']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 15, right: 15 }
      });
      
      // Tasks by status
      let currentY = doc.lastAutoTable.finalY + 15;
      
      Object.entries(STATUSES).forEach(([status, config]) => {
        const statusItems = filteredItems.filter(item => item.status === status);
        
        if (statusItems.length > 0) {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${config.label} (${statusItems.length})`, 15, currentY);
          
          currentY += 5;
          
          const tableData = statusItems.map(item => [
            item.object,
            item.action.length > 40 ? item.action.substring(0, 40) + '...' : item.action,
            item.responsible,
            PRIORITIES[item.priority].icon + ' ' + PRIORITIES[item.priority].label,
            item.timeSpent > 0 ? formatTime(item.timeSpent) : '-',
            `${item.budget || 0} €`
          ]);
          
          autoTable(doc, {
            startY: currentY,
            head: [['Objet', 'Action', 'Responsable', 'Priorité', 'Temps', 'Budget']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
              fillColor: status === 'done' ? [34, 197, 94] : status === 'inProgress' ? [234, 179, 8] : [148, 163, 184],
              fontSize: 9,
              fontStyle: 'bold'
            },
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 50 },
              2: { cellWidth: 25 },
              3: { cellWidth: 25 },
              4: { cellWidth: 20 },
              5: { cellWidth: 20 }
            },
            margin: { left: 15, right: 15 }
          });
          
          currentY = doc.lastAutoTable.finalY + 10;
        }
      });
      
      // Team performance
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('👥 Performance par Responsable', 15, currentY);
      
      currentY += 5;
      
      const responsibles = [...new Set(items.map(i => i.responsible))];
      const teamData = responsibles.map(responsible => {
        const userItems = items.filter(i => i.responsible === responsible);
        const userDone = userItems.filter(i => i.status === 'done').length;
        const userRate = userItems.length > 0 ? Math.round((userDone / userItems.length) * 100) : 0;
        const userTime = userItems.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
        const userBudget = userItems.reduce((acc, item) => acc + (item.budget || 0), 0);
        
        return [
          responsible,
          userItems.length.toString(),
          userDone.toString(),
          `${userRate}%`,
          formatTime(userTime),
          `${userBudget.toLocaleString('fr-FR')} €`
        ];
      });
      
      autoTable(doc, {
        startY: currentY,
        head: [['Responsable', 'Total', 'Terminées', 'Taux', 'Temps', 'Budget']],
        body: teamData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 15, right: 15 }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `FluxTracker Pro - Généré le ${date}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth - 15,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      doc.save(`FluxTracker-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('✅ PDF exporté avec succès');
      addToHistory('Export', 'Rapport PDF généré');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('❌ Erreur lors de la génération du PDF', 'error');
    }
  };

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {Object.entries(STATUSES).map(([status, config]) => (
        <div 
          key={status} 
          className={`flex flex-col ${darkMode ? 'bg-slate-800/50' : 'bg-white/60'} backdrop-blur-sm rounded-xl p-3 md:p-4 border-2 ${draggedItem ? 'border-dashed border-blue-500' : 'border-transparent'}`}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(status)}
        >
          <div className="mb-3 md:mb-4 flex items-center gap-2 pb-3 border-b-2 border-slate-200/50 dark:border-slate-700/50">
            {React.createElement(config.icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
            <h3 className="font-semibold text-base md:text-lg">{config.label}</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {filteredItems.filter(i => i.status === status).length}
            </Badge>
          </div>
          <div className="space-y-2 md:space-y-3 flex-1">
            {filteredItems
              .filter(item => item.status === status)
              .map(item => (
                <Card 
                  key={item.id}
                  draggable={!editingItem}
                  onDragStart={() => handleDragStart(item)}
                  className={`group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500/30 ${editingItem?.id === item.id ? 'ring-2 ring-blue-500' : 'cursor-move'} ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                >
                  <CardContent className="p-3 md:p-4">
                    {editingItem?.id === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingItem.object}
                          onChange={(e) => setEditingItem({ ...editingItem, object: e.target.value })}
                          className="font-semibold text-sm md:text-base"
                          placeholder="Objet"
                        />
                        <Input
                          value={editingItem.action}
                          onChange={(e) => setEditingItem({ ...editingItem, action: e.target.value })}
                          className="text-xs md:text-sm"
                          placeholder="Action"
                        />
                        <Input
                          value={editingItem.responsible}
                          onChange={(e) => setEditingItem({ ...editingItem, responsible: e.target.value })}
                          className="text-xs md:text-sm"
                          placeholder="Responsable"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={editingItem.estimatedHours}
                            onChange={(e) => setEditingItem({ ...editingItem, estimatedHours: parseInt(e.target.value) || 0 })}
                            className="text-xs"
                            placeholder="Heures"
                          />
                          <Input
                            type="number"
                            value={editingItem.budget}
                            onChange={(e) => setEditingItem({ ...editingItem, budget: parseInt(e.target.value) || 0 })}
                            className="text-xs"
                            placeholder="Budget €"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEditItem} size="sm" className="flex-1 text-xs">
                            <Save className="w-3 h-3 mr-1" />
                            Sauver
                          </Button>
                          <Button onClick={cancelEditItem} variant="outline" size="sm" className="flex-1 text-xs">
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.object}
                          </h4>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditItem(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                              title="Éditer"
                            >
                              <Edit2 className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTimer(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                              title={activeTimer === item.id ? "Arrêter" : "Démarrer"}
                            >
                              <Timer className={`w-3 h-3 md:w-4 md:h-4 ${activeTimer === item.id ? 'text-green-500 animate-pulse' : 'text-blue-500'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-2 md:mb-3">{item.action}</p>
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Responsable</div>
                            <div className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{item.responsible}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2 text-xs">
                          {item.timeSpent > 0 && (
                            <Badge variant="outline" className="text-xs">
                              ⏱️ {formatTime(item.timeSpent)}
                            </Badge>
                          )}
                          {item.estimatedHours > 0 && (
                            <Badge variant="outline" className="text-xs">
                              📅 {item.estimatedHours}h
                            </Badge>
                          )}
                          {item.budget > 0 && (
                            <Badge variant="outline" className="text-xs">
                              💰 {item.budget}€
                            </Badge>
                          )}
                          {item.dependencies && item.dependencies.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              🔗 {item.dependencies.length}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${PRIORITIES[item.priority].color} border text-xs`}>
                            {PRIORITIES[item.priority].icon} {PRIORITIES[item.priority].label}
                          </Badge>
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(item.id, e.target.value)}
                            className={`ml-auto text-xs border rounded px-2 py-1 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white'} hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer`}
                          >
                            {Object.entries(STATUSES).map(([key, val]) => (
                              <option key={key} value={key}>{val.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2 md:space-y-3">
      {filteredItems.map(item => (
        <Card 
          key={item.id}
          className={`group hover:shadow-md transition-all duration-200 border-2 hover:border-blue-500/30 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
        >
          <CardContent className="p-3 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
              <div className="md:col-span-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Objet</div>
                <div className="font-semibold text-sm md:text-base text-slate-900 dark:text-slate-100">{item.object}</div>
              </div>
              <div className="md:col-span-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Action</div>
                <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300">{item.action}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Responsable</div>
                <div className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{item.responsible}</div>
              </div>
              <div className="md:col-span-1">
                <Badge className={`${PRIORITIES[item.priority].color} border text-xs w-full justify-center`}>
                  {PRIORITIES[item.priority].icon}
                </Badge>
              </div>
              <div className="md:col-span-1">
                <Badge className={`${STATUSES[item.status].color} border text-xs w-full justify-center`}>
                  {React.createElement(STATUSES[item.status].icon, { className: 'w-3 h-3' })}
                </Badge>
              </div>
              <div className="md:col-span-1 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditItem(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  <Edit2 className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTimer(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  <Timer className={`w-3 h-3 md:w-4 md:h-4 ${activeTimer === item.id ? 'text-green-500' : 'text-blue-500'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStatsView = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className={`border-2 border-blue-500/20 ${darkMode ? 'bg-gradient-to-br from-blue-950 to-slate-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Total</div>
          </CardContent>
        </Card>
        <Card className={`border-2 border-yellow-500/20 ${darkMode ? 'bg-gradient-to-br from-yellow-950 to-slate-900' : 'bg-gradient-to-br from-yellow-50 to-white'}`}>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">En cours</div>
          </CardContent>
        </Card>
        <Card className={`border-2 border-green-500/20 ${darkMode ? 'bg-gradient-to-br from-green-950 to-slate-900' : 'bg-gradient-to-br from-green-50 to-white'}`}>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.done}</div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Terminées</div>
          </CardContent>
        </Card>
        <Card className={`border-2 border-purple-500/20 ${darkMode ? 'bg-gradient-to-br from-purple-950 to-slate-900' : 'bg-gradient-to-br from-purple-50 to-white'}`}>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.totalBudget.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Budget €</div>
          </CardContent>
        </Card>
      </div>

      <Card className={darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Progression du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Taux de complétion</span>
                <span className="text-xs md:text-sm font-bold text-green-600">{stats.completionRate}%</span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-3 md:h-4 overflow-hidden`}>
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
              <div className={`text-center p-3 md:p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
                <div className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.todo}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">À faire</div>
              </div>
              <div className={`text-center p-3 md:p-4 ${darkMode ? 'bg-yellow-950' : 'bg-yellow-50'} rounded-lg`}>
                <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">En cours</div>
              </div>
              <div className={`text-center p-3 md:p-4 ${darkMode ? 'bg-green-950' : 'bg-green-50'} rounded-lg`}>
                <div className="text-xl md:text-2xl font-bold text-green-600">{stats.done}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terminées</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            Performance équipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...new Set(items.map(i => i.responsible))].map(responsible => {
              const userItems = items.filter(i => i.responsible === responsible);
              const userDone = userItems.filter(i => i.status === 'done').length;
              const userRate = Math.round((userDone / userItems.length) * 100);
              const userTime = userItems.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
              
              return (
                <div key={responsible} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="w-full md:w-40 font-medium text-xs md:text-sm">{responsible}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {userDone}/{userItems.length} • {formatTime(userTime)}
                      </span>
                      <span className="text-xs font-medium">{userRate}%</span>
                    </div>
                    <div className={`w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-2`}>
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${userRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50'} p-3 md:p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ⚡ FluxTracker Pro
              </h1>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1 md:mt-2 text-xs md:text-sm`}>
                Gestion intelligente • {items.length} tâches • {formatTime(stats.totalTimeSpent)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowTemplates(true)}
                variant="outline"
                size="sm"
                className={`${darkMode ? 'border-slate-700 hover:bg-slate-800' : ''} text-xs md:text-sm`}
              >
                <Zap className="w-4 h-4 mr-1" />
                Templates
              </Button>
              <Button
                onClick={() => setShowAI(true)}
                variant="outline"
                size="sm"
                className={`${darkMode ? 'border-slate-700 hover:bg-slate-800' : ''} text-xs md:text-sm`}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                IA
              </Button>
              <Button
                onClick={() => setShowBudget(true)}
                variant="outline"
                size="sm"
                className={`${darkMode ? 'border-slate-700 hover:bg-slate-800' : ''} text-xs md:text-sm`}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Budget
              </Button>
              <Button
                onClick={() => setShowRisks(true)}
                variant="outline"
                size="sm"
                className={`${darkMode ? 'border-slate-700 hover:bg-slate-800' : ''} text-xs md:text-sm`}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Risques
              </Button>
              <Button 
                onClick={() => setShowNewItemForm(!showNewItemForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-xs md:text-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nouvelle
              </Button>
            </div>
          </div>

          {/* Stats Banner - Responsive */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-4 md:mb-6">
            <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-2 md:p-3 border ${darkMode ? 'border-slate-700' : 'border-slate-200/50'}`}>
              <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{stats.total}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-2 md:p-3 border ${darkMode ? 'border-slate-700' : 'border-slate-200/50'}`}>
              <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{stats.todo}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>À faire</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-2 md:p-3 border ${darkMode ? 'border-yellow-700/50' : 'border-yellow-200/50'}`}>
              <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cours</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-2 md:p-3 border ${darkMode ? 'border-green-700/50' : 'border-green-200/50'}`}>
              <div className="text-lg md:text-2xl font-bold text-green-600">{stats.done}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>OK</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-2 md:p-3 border ${darkMode ? 'border-slate-700' : 'border-slate-200/50'}`}>
              <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{activeTimer ? '▶️' : '⏸️'}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chrono</div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 md:p-3 text-white">
              <div className="text-lg md:text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-xs opacity-90">Prog.</div>
            </div>
          </div>

          {/* New Item Form - Mobile optimized */}
          {showNewItemForm && (
            <Card className={`mb-4 md:mb-6 border-2 border-blue-500/30 shadow-lg ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold">✨ Nouvelle tâche</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewItemForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Objet</label>
                    <Input
                      value={newItem.object}
                      onChange={(e) => setNewItem({ ...newItem, object: e.target.value })}
                      placeholder="Ex: Migration BDD"
                      className={`border-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Responsable</label>
                    <Input
                      value={newItem.responsible}
                      onChange={(e) => setNewItem({ ...newItem, responsible: e.target.value })}
                      placeholder="Ex: Sophie Martin"
                      className={`border-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs md:text-sm font-medium mb-2 block">Action</label>
                    <Input
                      value={newItem.action}
                      onChange={(e) => setNewItem({ ...newItem, action: e.target.value })}
                      placeholder="Ex: Planifier la migration..."
                      className={`border-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Priorité</label>
                    <select
                      value={newItem.priority}
                      onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                      className={`w-full border-2 rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                    >
                      {Object.entries(PRIORITIES).map(([key, val]) => (
                        <option key={key} value={key}>{val.icon} {val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Statut</label>
                    <select
                      value={newItem.status}
                      onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                      className={`w-full border-2 rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
                    >
                      {Object.entries(STATUSES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Heures estimées</label>
                    <Input
                      type="number"
                      value={newItem.estimatedHours}
                      onChange={(e) => setNewItem({ ...newItem, estimatedHours: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 24"
                      className={`border-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-2 block">Budget (€)</label>
                    <Input
                      type="number"
                      value={newItem.budget}
                      onChange={(e) => setNewItem({ ...newItem, budget: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 6000"
                      className={`border-2 text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={addItem}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewItemForm(false)} className="text-sm">
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Toolbar - Mobile optimized */}
          <div className={`${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-3 md:p-4 border ${darkMode ? 'border-slate-700' : 'border-slate-200/50'} shadow-sm`}>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <Input
                  id="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher... (Ctrl+K)"
                  className={`pl-9 md:pl-10 border-2 text-sm ${darkMode ? 'bg-slate-900 border-slate-700' : ''}`}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                  className={`${showFilters ? "bg-blue-600" : darkMode ? "border-slate-700" : ""} text-xs md:text-sm`}
                >
                  <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Filtres
                </Button>

                <Button
                  variant="outline"
                  onClick={exportToPDF}
                  size="sm"
                  className={`${darkMode ? "border-slate-700" : ""} text-xs md:text-sm`}
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  size="sm"
                  className={`${darkMode ? "border-slate-700" : ""} text-xs md:text-sm hidden md:flex`}
                >
                  <History className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Historique
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowShortcuts(true)}
                  size="sm"
                  className={`${darkMode ? "border-slate-700" : ""} text-xs md:text-sm hidden md:flex`}
                >
                  <Key className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Raccourcis
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setDarkMode(!darkMode)}
                  size="sm"
                  className={darkMode ? "border-slate-700" : ""}
                >
                  {darkMode ? <Sun className="w-3 h-3 md:w-4 md:h-4" /> : <Moon className="w-3 h-3 md:w-4 md:h-4" />}
                </Button>
                
                <div className={`flex gap-1 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-lg p-1`}>
                  <Button
                    variant={view === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('kanban')}
                    className={`${view === 'kanban' ? `${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm` : ''} p-1 h-auto`}
                    title="Kanban (1)"
                  >
                    <Grid3x3 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('list')}
                    className={`${view === 'list' ? `${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm` : ''} p-1 h-auto`}
                    title="Liste (2)"
                  >
                    <List className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant={view === 'stats' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('stats')}
                    className={`${view === 'stats' ? `${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm` : ''} p-1 h-auto`}
                    title="Stats (3)"
                  >
                    <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div>
                  <label className="text-xs md:text-sm font-medium mb-2 block">Priorité</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className={`w-full border-2 rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                  >
                    <option value="all">Toutes</option>
                    {Object.entries(PRIORITIES).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium mb-2 block">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full border-2 rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}
                  >
                    <option value="all">Tous</option>
                    {Object.entries(STATUSES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 md:mt-6">
          {view === 'kanban' && renderKanbanView()}
          {view === 'list' && renderListView()}
          {view === 'stats' && renderStatsView()}
        </div>

        {/* Footer */}
        <div className={`mt-6 md:mt-8 text-center text-xs md:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <p>💡 {filteredItems.length} tâche{filteredItems.length > 1 ? 's' : ''} • Sauvegarde auto • Ctrl+/ raccourcis</p>
        </div>
      </div>

      {/* Modals - All responsive */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowShortcuts(false)}>
          <Card className={`max-w-md w-full ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Key className="w-4 h-4 md:w-5 md:h-5" />
                Raccourcis clavier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                {[
                  ['Rechercher', 'Ctrl+K'],
                  ['Nouvelle tâche', 'Ctrl+N'],
                  ['Vue Kanban', '1'],
                  ['Vue Liste', '2'],
                  ['Vue Stats', '3'],
                  ['Raccourcis', 'Ctrl+/']
                ].map(([action, key]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{action}</span>
                    <kbd className={`px-2 py-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded text-xs font-mono`}>{key}</kbd>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowShortcuts(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHistory(false)}>
          <Card className={`max-w-2xl w-full max-h-[80vh] overflow-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <History className="w-4 h-4 md:w-5 md:h-5" />
                Historique ({history.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Aucun historique</p>
                ) : (
                  history.map(entry => (
                    <div key={entry.id} className={`p-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{entry.action}</span>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{entry.details}</p>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                          {new Date(entry.timestamp).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => setShowHistory(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAI(false)}>
          <Card className={`max-w-2xl w-full max-h-[80vh] overflow-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                Assistant IA - Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiSuggestions.length === 0 ? (
                  <div className={`p-4 ${darkMode ? 'bg-green-950/30' : 'bg-green-50'} border border-green-500/20 rounded-lg`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl md:text-2xl">🎉</span>
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm md:text-base">Tout va bien !</h4>
                        <p className={`text-xs md:text-sm ${darkMode ? 'text-green-300' : 'text-green-600'} mt-1`}>
                          Votre gestion de projet est optimale.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className={`p-3 md:p-4 ${
                        suggestion.type === 'warning' 
                          ? darkMode ? 'bg-red-950/30' : 'bg-red-50' 
                          : suggestion.type === 'info'
                          ? darkMode ? 'bg-blue-950/30' : 'bg-blue-50'
                          : darkMode ? 'bg-green-950/30' : 'bg-green-50'
                      } border ${
                        suggestion.type === 'warning'
                          ? 'border-red-500/20'
                          : suggestion.type === 'info'
                          ? 'border-blue-500/20'
                          : 'border-green-500/20'
                      } rounded-lg`}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <span className="text-lg md:text-2xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm md:text-base ${
                            suggestion.type === 'warning'
                              ? 'text-red-700 dark:text-red-400'
                              : suggestion.type === 'info'
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-green-700 dark:text-green-400'
                          }`}>
                            {suggestion.title}
                          </h4>
                          <p className={`text-xs md:text-sm ${
                            suggestion.type === 'warning'
                              ? darkMode ? 'text-red-300' : 'text-red-600'
                              : suggestion.type === 'info'
                              ? darkMode ? 'text-blue-300' : 'text-blue-600'
                              : darkMode ? 'text-green-300' : 'text-green-600'
                          } mt-1`}>
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => setShowAI(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTemplates(false)}>
          <Card className={`max-w-3xl w-full max-h-[80vh] overflow-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                Templates de Projets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <div 
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className={`p-4 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'} rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-blue-500`}
                  >
                    <h4 className="font-semibold text-base md:text-lg mb-2">{template.name}</h4>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-3`}>
                      {template.items.length} tâches prédéfinies
                    </p>
                    <div className="space-y-1">
                      {template.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          • {item.object}
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          ... et {template.items.length - 3} autres
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                      Utiliser
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowTemplates(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showBudget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBudget(false)}>
          <Card className={`max-w-2xl w-full max-h-[80vh] overflow-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                Suivi Budgétaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Budget total</span>
                    <span className="text-2xl font-bold text-green-600">{stats.totalBudget.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {stats.totalEstimatedHours}h estimées
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Répartition par tâche</h4>
                  {items.map(item => (
                    <div key={item.id} className={`p-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg mb-2`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.object}</div>
                          <div className="text-xs text-slate-500">{item.estimatedHours}h • {item.responsible}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{item.budget.toLocaleString()} €</div>
                          <Badge variant="outline" className={`text-xs mt-1 ${STATUSES[item.status].color}`}>
                            {STATUSES[item.status].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => setShowBudget(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showRisks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRisks(false)}>
          <Card className={`max-w-2xl w-full max-h-[80vh] overflow-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                Gestion des Risques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risks.map(risk => (
                  <div key={risk.id} className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg border-l-4 ${
                    risk.impact === 'high' ? 'border-red-500' : risk.impact === 'medium' ? 'border-orange-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{risk.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Impact: {risk.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Prob: {risk.probability}
                        </Badge>
                      </div>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowRisks(false)} className="w-full mt-4">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}