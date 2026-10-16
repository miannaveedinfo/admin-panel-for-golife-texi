import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TRANSLATIONS, formatPKR } from '../utils/i18n';
import {
  NotificationRecord,
  NotificationTemplate,
  NotificationType,
  NotificationPriority,
  NotificationRecipientType,
  NotificationDeliveryChannel,
  RideCategory
} from '../types';
import {
  replaceTemplatePlaceholders,
  draftNotificationWithAi,
  INITIAL_DEMO_NOTIFICATIONS,
  INITIAL_NOTIFICATION_TEMPLATES
} from '../services/notificationService';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  Bell,
  Send,
  FileText,
  Radio,
  Sliders,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  User,
  Users,
  Smartphone,
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Filter,
  Check,
  RotateCcw,
  Zap,
  ShieldAlert,
  CreditCard,
  UserCheck,
  Tag,
  Share2,
  Inbox,
  SendHorizontal,
  Info,
  ChevronRight,
  RefreshCw,
  Copy
} from 'lucide-react';

export const NotificationsCenterView: React.FC = () => {
  const {
    notifications,
    notificationTemplates,
    notificationDeliveryLogs,
    sendTargetedNotification,
    toggleNotificationRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    triggerAutomatedNotification,
    drivers,
    passengers,
    rides,
    cities,
    language,
    dataSource,
    selectedCityFilter,
    openUniversalDetail,
    setActiveTab,
    showToast
  } = useAdmin();

  const [activeTab, setActiveTabLocal] = useState<
    'inbox' | 'compose' | 'templates' | 'triggers' | 'channels'
  >('inbox');

  const safeTemplates: NotificationTemplate[] = useMemo(() => {
    if (notificationTemplates && notificationTemplates.length > 0) {
      return notificationTemplates;
    }
    return dataSource === 'PRODUCTION' ? [] : INITIAL_NOTIFICATION_TEMPLATES;
  }, [notificationTemplates, dataSource]);

  const safeNotifications: NotificationRecord[] = useMemo(() => {
    const rawList = dataSource === 'PRODUCTION'
      ? (Array.isArray(notifications) ? (notifications as unknown as NotificationRecord[]) : [])
      : (Array.isArray(notifications) && notifications.length > 0 && (notifications[0] as any).recipientType
          ? (notifications as unknown as NotificationRecord[])
          : INITIAL_DEMO_NOTIFICATIONS);

    return rawList.map((item: any, idx) => {
      const recipientType: NotificationRecipientType =
        item.recipientType ||
        (item.target === 'drivers'
          ? 'drivers'
          : item.target === 'passengers'
          ? 'passengers'
          : item.targetAudience === 'driver'
          ? 'drivers'
          : item.targetAudience === 'passenger'
          ? 'passengers'
          : 'all');

      return {
        id: item.id || `notif-${idx}`,
        title: item.title || 'System Notification',
        titleUrdu: item.titleUrdu || '',
        message: item.message || item.body || '',
        messageUrdu: item.messageUrdu || '',
        type: item.type || 'system',
        priority: item.priority || 'normal',
        recipientType,
        targetAudience: item.targetAudience || (recipientType.includes('driver') ? 'driver' : recipientType.includes('passenger') ? 'passenger' : 'all'),
        targetCity: item.targetCity || item.recipientCity || 'All',
        recipientCity: item.recipientCity || item.targetCity || 'All',
        recipientName: item.recipientName || '',
        recipientPhone: item.recipientPhone || '',
        channels: Array.isArray(item.channels) ? item.channels : ['in_app'],
        status: item.status || 'delivered',
        read: Boolean(item.read),
        sentAt: item.sentAt || new Date().toISOString(),
        createdAt: item.createdAt || item.sentAt || new Date().toISOString(),
        reachCount: item.reachCount || 1,
        ...item
      } as NotificationRecord;
    });
  }, [notifications]);

  // Inbox filter states
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState(selectedCityFilter || 'All');

  // Composer Form State
  const [recipientType, setRecipientType] = useState<NotificationRecipientType>('drivers');
  const [targetDriverId, setTargetDriverId] = useState<string>(drivers?.[0]?.id || '');
  const [targetPassengerId, setTargetPassengerId] = useState<string>(passengers?.[0]?.id || '');
  const [targetCity, setTargetCity] = useState<string>('All');
  const [targetCategory, setTargetCategory] = useState<RideCategory>('GoMini');
  const [notifType, setNotifType] = useState<NotificationType>('system');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [channels, setChannels] = useState<NotificationDeliveryChannel[]>(['in_app', 'push_fcm']);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [message, setMessage] = useState('');
  const [messageUrdu, setMessageUrdu] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<NotificationType>('driver_verification');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateTitleUrdu, setTemplateTitleUrdu] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [templateMessageUrdu, setTemplateMessageUrdu] = useState('');
  const [templatePriority, setTemplatePriority] = useState<NotificationPriority>('normal');
  const [templateAudience, setTemplateAudience] = useState<'driver' | 'passenger' | 'both'>('driver');

  // Selected Notification Preview Modal
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  // Summary Metrics
  const totalCount = safeNotifications.length;
  const unreadCount = safeNotifications.filter((n) => !n.read).length;
  const driverNotifsCount = safeNotifications.filter((n) => (n.recipientType || '').includes('driver')).length;
  const passengerNotifsCount = safeNotifications.filter((n) => (n.recipientType || '').includes('passenger')).length;
  const criticalCount = safeNotifications.filter((n) => n.priority === 'critical' || n.priority === 'urgent').length;

  // Filtered Notifications in Inbox
  const filteredNotifications = useMemo(() => {
    return safeNotifications.filter((n) => {
      if (filterStatus === 'unread' && n.read) return false;
      if (filterStatus === 'read' && !n.read) return false;

      if (filterType !== 'all') {
        if (filterType === 'important' && !(n.priority === 'urgent' || n.priority === 'critical')) return false;
        if (filterType === 'driver' && !(n.recipientType || '').includes('driver')) return false;
        if (filterType === 'passenger' && !(n.recipientType || '').includes('passenger')) return false;
        if (filterType === 'financial' && !['payout', 'refund', 'payment', 'fine'].includes(n.type)) return false;
        if (filterType === 'safety' && !['safety', 'suspension', 'complaint'].includes(n.type)) return false;
        if (filterType === 'ride' && n.type !== 'ride') return false;
        if (filterType === 'verification' && !['driver_verification', 'document_expiry'].includes(n.type)) return false;
        if (filterType === 'system' && !['system', 'promotional', 'maintenance'].includes(n.type)) return false;
      }

      if (cityFilter !== 'All') {
        if (n.recipientCity && n.recipientCity !== 'All' && n.recipientCity !== cityFilter && n.targetCity !== cityFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(query) || (n.titleUrdu && n.titleUrdu.includes(query));
        const matchMsg = n.message.toLowerCase().includes(query) || (n.messageUrdu && n.messageUrdu.includes(query));
        const matchRecipient = (n.recipientName && n.recipientName.toLowerCase().includes(query)) ||
          (n.recipientPhone && n.recipientPhone.includes(query)) ||
          (n.recipientCity && n.recipientCity.toLowerCase().includes(query));
        const matchId = n.id.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg && !matchRecipient && !matchId) return false;
      }

      return true;
    });
  }, [notifications, filterStatus, filterType, cityFilter, searchQuery]);

  // Handle template selection in Composer
  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = safeTemplates.find((t) => t.id === tmplId);
    if (!tmpl) return;

    let targetName = 'Partner';
    let targetPhone = '+92 300 0000000';
    let city = targetCity !== 'All' ? targetCity : 'Lahore';

    if (recipientType === 'driver_single') {
      const d = drivers.find((drv) => drv.id === targetDriverId);
      if (d) {
        targetName = d.name;
        targetPhone = d.phone;
        city = d.city;
      }
    } else if (recipientType === 'passenger_single') {
      const p = passengers.find((psg) => psg.id === targetPassengerId);
      if (p) {
        targetName = p.name;
        targetPhone = p.phone;
      }
    }

    const placeholderData = {
      driverName: targetName,
      passengerName: targetName,
      rideId: 'GL-PK-89104',
      amount: '500',
      city: city,
      date: new Date().toLocaleDateString('en-GB'),
      reason: 'Standard compliance check',
      duration: '24 Hours',
      documentType: 'Driving License',
      paymentMethod: 'EasyPaisa',
      accountNumber: targetPhone
    };

    setTitle(replaceTemplatePlaceholders(tmpl.title, placeholderData));
    setTitleUrdu(replaceTemplatePlaceholders(tmpl.titleUrdu, placeholderData));
    setMessage(replaceTemplatePlaceholders(tmpl.message, placeholderData));
    setMessageUrdu(replaceTemplatePlaceholders(tmpl.messageUrdu, placeholderData));
    setNotifType(tmpl.type);
    setPriority(tmpl.priority);
    setChannels(tmpl.defaultChannels);
  };

  // Insert placeholder at cursor/end of message
  const handleInsertPlaceholder = (placeholder: string) => {
    setMessage((prev) => `${prev} ${placeholder}`);
  };

  // AI Assistant Draft Generator
  const handleAiDraft = (intent: 'compliance' | 'weather' | 'fare_dispute' | 'general' | 'payout') => {
    const isDriver = recipientType.includes('driver');
    let targetName = isDriver ? 'Driver Partner' : 'Passenger';
    let city = targetCity !== 'All' ? targetCity : 'Lahore';

    if (recipientType === 'driver_single') {
      const d = drivers.find((drv) => drv.id === targetDriverId);
      if (d) { targetName = d.name; city = d.city; }
    } else if (recipientType === 'passenger_single') {
      const p = passengers.find((psg) => psg.id === targetPassengerId);
      if (p) { targetName = p.name; }
    }

    const drafted = draftNotificationWithAi(intent, isDriver ? 'driver' : 'passenger', {
      name: targetName,
      city,
      amount: 450,
      reason: 'Operational performance'
    });

    setTitle(drafted.title);
    setTitleUrdu(drafted.titleUrdu);
    setMessage(drafted.message);
    setMessageUrdu(drafted.messageUrdu);
    setPriority(drafted.priority);
    showToast('AI notification draft generated successfully', 'info');
  };

  // Channel toggling helper
  const toggleChannel = (ch: NotificationDeliveryChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  // Submit Notification Broadcast
  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      showToast('Please enter both Title and Message before sending', 'error');
      return;
    }

    if (channels.length === 0) {
      showToast('Please select at least one delivery channel (e.g. In-App or Push Notification)', 'error');
      return;
    }

    let recId: string | undefined;
    let recName: string | undefined;
    let recPhone: string | undefined;
    let reachCount = 1;

    if (recipientType === 'driver_single') {
      const d = drivers.find((drv) => drv.id === targetDriverId);
      if (d) {
        recId = d.id;
        recName = d.name;
        recPhone = d.phone;
      }
    } else if (recipientType === 'passenger_single') {
      const p = passengers.find((psg) => psg.id === targetPassengerId);
      if (p) {
        recId = p.id;
        recName = p.name;
        recPhone = p.phone;
      }
    } else if (recipientType === 'drivers') {
      reachCount = drivers.length * 52;
      recName = `All Active Drivers (${drivers.length})`;
    } else if (recipientType === 'passengers') {
      reachCount = passengers.length * 140;
      recName = `All Registered Passengers (${passengers.length})`;
    } else if (recipientType === 'drivers_city') {
      reachCount = drivers.filter((d) => targetCity === 'All' || d.city === targetCity).length * 48;
      recName = `Drivers in ${targetCity}`;
    } else if (recipientType === 'passengers_city') {
      reachCount = 1200;
      recName = `Passengers in ${targetCity}`;
    } else if (recipientType === 'driver_category') {
      reachCount = drivers.filter((d) => d.category === targetCategory).length * 50;
      recName = `${targetCategory} Fleet`;
    } else {
      reachCount = 15000;
      recName = 'All Users Nationwide';
    }

    sendTargetedNotification({
      title,
      titleUrdu,
      message,
      messageUrdu,
      type: notifType,
      priority,
      recipientType,
      recipientId: recId,
      recipientName: recName,
      recipientPhone: recPhone,
      recipientCity: targetCity,
      recipientCategory: targetCategory,
      channels,
      source: 'manual',
      reachCount,
      scheduledFor: isScheduleEnabled ? scheduledTime : undefined,
      status: isScheduleEnabled ? 'pending' : 'delivered'
    });

    setShowConfirmModal(false);
    setTitle('');
    setTitleUrdu('');
    setMessage('');
    setMessageUrdu('');
    setSelectedTemplateId('');
    setActiveTabLocal('inbox');
  };

  // Template Save (Add or Update)
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateTitle.trim() || !templateMessage.trim()) {
      showToast('Please fill all required template fields', 'error');
      return;
    }

    if (editingTemplate) {
      updateNotificationTemplate(editingTemplate.id, {
        name: templateName,
        type: templateType,
        title: templateTitle,
        titleUrdu: templateTitleUrdu,
        message: templateMessage,
        messageUrdu: templateMessageUrdu,
        priority: templatePriority,
        targetAudience: templateAudience
      });
      showToast('Template updated successfully', 'success');
    } else {
      addNotificationTemplate({
        name: templateName,
        type: templateType,
        title: templateTitle,
        titleUrdu: templateTitleUrdu,
        message: templateMessage,
        messageUrdu: templateMessageUrdu,
        priority: templatePriority,
        defaultChannels: ['in_app', 'push_fcm'],
        targetAudience: templateAudience,
        placeholders: ['{driverName}', '{passengerName}', '{amount}', '{rideId}', '{city}'],
        active: true
      });
      showToast('New template added', 'success');
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleOpenEditTemplate = (tmpl: NotificationTemplate) => {
    setEditingTemplate(tmpl);
    setTemplateName(tmpl.name);
    setTemplateType(tmpl.type);
    setTemplateTitle(tmpl.title);
    setTemplateTitleUrdu(tmpl.titleUrdu);
    setTemplateMessage(tmpl.message);
    setTemplateMessageUrdu(tmpl.messageUrdu);
    setTemplatePriority(tmpl.priority);
    setTemplateAudience(tmpl.targetAudience);
    setShowTemplateModal(true);
  };

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" />CRITICAL</span>;
      case 'urgent':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />URGENT</span>;
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">HIGH</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">NORMAL</span>;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'driver_verification':
      case 'document_expiry':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'fine':
      case 'suspension':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'payout':
      case 'refund':
      case 'payment':
        return <CreditCard className="w-4 h-4 text-teal-600" />;
      case 'safety':
      case 'complaint':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'ride':
        return <Car className="w-4 h-4 text-indigo-600" />;
      case 'promotional':
        return <Tag className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5 text-slate-900">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 border border-amber-500/40 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Bell className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>Notification & Communication Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  PHASE 47
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Unified messaging engine for Admin, Drivers, and Passengers • FCM Push, SMS & In-App
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTabLocal('inbox')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox & Activity</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabLocal('compose')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('templates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Templates ({safeTemplates.length})</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('triggers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'triggers'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automated Triggers</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('channels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>FCM & Adapters</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Notifications</span>
          <div className="text-xl font-black text-slate-950 mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-400">All historical dispatches</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Unread / Pending</span>
          <div className="text-xl font-black text-amber-600 mt-1">{unreadCount}</div>
          <span className="text-[10px] text-slate-400">Requires attention</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Driver Notifications</span>
          <div className="text-xl font-black text-teal-700 mt-1">{driverNotifsCount}</div>
          <span className="text-[10px] text-slate-400">KYC, fines & payouts</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Passenger Notices</span>
          <div className="text-xl font-black text-indigo-700 mt-1">{passengerNotifsCount}</div>
          <span className="text-[10px] text-slate-400">Refunds, promos, safety</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-slate-500">Urgent & Critical</span>
          <div className="text-xl font-black text-rose-600 mt-1">{criticalCount}</div>
          <span className="text-[10px] text-slate-400">SOS & suspensions</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: INBOX & COMMUNICATION ACTIVITY
         ======================================================== */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Category Filter, Priority, City, Actions */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notification title, recipient, phone or keyword..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="All">City: All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
              </select>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Read</span>
                </button>
              )}

              {/* Quick Compose shortcut */}
              <button
                onClick={() => setActiveTabLocal('compose')}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Notices' },
              { id: 'important', label: 'Important & Urgent' },
              { id: 'driver', label: 'Driver Messages' },
              { id: 'passenger', label: 'Passenger Messages' },
              { id: 'financial', label: 'Financial (Payouts/Fines)' },
              { id: 'safety', label: 'Safety & Suspensions' },
              { id: 'verification', label: 'KYC & Verifications' },
              { id: 'system', label: 'System & Promos' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition cursor-pointer ${
                  filterType === pill.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">No Notifications Match the Selected Filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try switching the status filter, clearing your search query, or compose a new targeted broadcast.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => {
                const isUrgent = notif.priority === 'critical' || notif.priority === 'urgent';
                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl bg-white border transition shadow-2xs hover:shadow-sm ${
                      !notif.read ? 'border-amber-400/80 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      {/* Left: Icon + Content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          {getTypeIcon(notif.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Top Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {getPriorityBadge(notif.priority)}

                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                              {notif.type.replace('_', ' ')}
                            </span>

                            {notif.recipientName && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                <User className="w-3 h-3 text-teal-600" />
                                <span>{notif.recipientName}</span>
                              </span>
                            )}

                            {notif.recipientCity && notif.recipientCity !== 'All' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                {notif.recipientCity}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{notif.sentAt || notif.createdAt}</span>
                            </span>

                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unread Notice" />
                            )}
                          </div>

                          {/* English Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                            {notif.title}
                          </h4>

                          {/* Urdu Title if available */}
                          {notif.titleUrdu && (
                            <p className="text-xs text-slate-600 font-urdu mt-0.5 text-right sm:text-left" dir="rtl">
                              {notif.titleUrdu}
                            </p>
                          )}

                          {/* Message Body */}
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Urdu Message Body if available */}
                          {notif.messageUrdu && (
                            <p className="text-xs text-slate-700 font-urdu mt-1 text-right sm:text-left leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200/60" dir="rtl">
                              {notif.messageUrdu}
                            </p>
                          )}

                          {/* Channel pills & Delivery stats */}
                          <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-400 font-medium">Channels:</span>
                            {notif.channels.map((ch) => (
                              <span
                                key={ch}
                                className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider"
                              >
                                {ch.replace('_', ' ')}
                              </span>
                            ))}

                            <span className="text-slate-300">•</span>

                            <span className="text-slate-500">
                              Status: <strong className="text-emerald-700 capitalize">{notif.status}</strong>
                            </span>

                            {typeof notif.reachCount === 'number' && notif.reachCount > 1 && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">
                                  Audience Reach: <strong>~{notif.reachCount.toLocaleString()}</strong>
                                </span>
                              </>
                            )}

                            {notif.relatedEntity && (
                              <>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (notif.relatedEntity?.type === 'driver' && notif.relatedEntity.id) {
                                      openUniversalDetail('driver', notif.relatedEntity.id);
                                    } else if (notif.relatedEntity?.type === 'verification') {
                                      setActiveTab('verification');
                                    } else if (notif.relatedEntity?.type === 'ride' && notif.relatedEntity.id) {
                                      openUniversalDetail('ride', notif.relatedEntity.id);
                                    } else if (notif.relatedEntity?.type === 'payout') {
                                      setActiveTab('wallets');
                                    } else if (notif.relatedEntity?.type === 'safety') {
                                      setActiveTab('safety');
                                    } else {
                                      showToast(`Viewing details for ${notif.relatedEntity?.label || notif.relatedEntity?.code}`, 'info');
                                    }
                                  }}
                                  className="text-amber-700 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Related: {notif.relatedEntity.label || notif.relatedEntity.code}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions: Read Toggle & Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleNotificationRead(notif.id)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            notif.read
                              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                          title={notif.read ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedNotification(notif)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="View Mobile Preview"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: COMPOSE TARGETED NOTIFICATION / BROADCAST
         ======================================================== */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Composer Form (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Targeted Notification Composer</h3>
                  <p className="text-xs text-slate-500">
                    Dispatch official alerts, announcements, policy updates or individual account notices
                  </p>
                </div>

                {/* AI Assistant Quick Draft Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    AI Draft:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAiDraft('compliance')}
                    className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 text-[10px] font-bold hover:bg-purple-100 transition cursor-pointer"
                  >
                    Compliance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiDraft('weather')}
                    className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 text-[10px] font-bold hover:bg-purple-100 transition cursor-pointer"
                  >
                    Monsoon Surge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiDraft('fare_dispute')}
                    className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 text-[10px] font-bold hover:bg-purple-100 transition cursor-pointer"
                  >
                    Fare Audit
                  </button>
                </div>
              </div>

              {/* Template Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pre-Configured Template (Optional)</span>
                  <span className="text-[11px] text-amber-700 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTabLocal('templates')}>
                    Manage Templates ➔
                  </span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Select Template to Autofill --</option>
                  {safeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.type.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Audience Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Recipient Audience</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as NotificationRecipientType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="driver_single">Single Specific Driver</option>
                    <option value="drivers">All Drivers (Nationwide)</option>
                    <option value="drivers_city">Drivers in Specific City</option>
                    <option value="driver_category">Specific Driver Vehicle Category</option>
                    <option value="passenger_single">Single Specific Passenger</option>
                    <option value="passengers">All Passengers (Nationwide)</option>
                    <option value="passengers_city">Passengers in Specific City</option>
                    <option value="all">All Users (Drivers & Passengers)</option>
                  </select>
                </div>

                {/* Sub-selector based on recipient type */}
                {recipientType === 'driver_single' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Driver Partner</label>
                    <select
                      value={targetDriverId}
                      onChange={(e) => setTargetDriverId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone} • {d.city} • {d.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === 'passenger_single' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Passenger</label>
                    <select
                      value={targetPassengerId}
                      onChange={(e) => setTargetPassengerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                    >
                      {passengers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(recipientType === 'drivers_city' || recipientType === 'passengers_city') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Select City</label>
                    <select
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="All">All Cities</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === 'driver_category' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Vehicle Category</label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value as RideCategory)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="GoMini">GoMini (Alto, Mehran, Cultus)</option>
                      <option value="GoRide">GoRide (City, Yaris, Alsvin)</option>
                      <option value="GoComfort">GoComfort (Corolla, Civic, Sedan)</option>
                      <option value="GoAuto">GoAuto (Rickshaw Auto)</option>
                      <option value="GoMoto">GoMoto (Bike Express)</option>
                      <option value="GoFreight">GoFreight (Pickups / Shahzore)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notification Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Notification Category</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="system">System Notification</option>
                    <option value="driver_verification">Driver Verification (KYC)</option>
                    <option value="document_expiry">Document Expiry Alert</option>
                    <option value="fine">Fine / Penalty Notice</option>
                    <option value="suspension">Dispatch Suspension</option>
                    <option value="payout">Payout / Settlement</option>
                    <option value="refund">Passenger Fare Refund</option>
                    <option value="ride">Ride & Cancellation</option>
                    <option value="safety">Safety SOS Alert</option>
                    <option value="complaint">Complaint Resolution</option>
                    <option value="promotional">Promotional & Surge</option>
                    <option value="maintenance">Platform Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Delivery Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority (Attention Required)</option>
                    <option value="critical">Critical (Immediate System Push)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Channels Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Delivery Channels (Multi-Channel Dispatch)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'in_app', label: 'In-App Alert', desc: 'Driver & Passenger In-App' },
                    { id: 'push_fcm', label: 'Push Notification', desc: 'Firebase FCM Service' },
                    { id: 'sms', label: 'Telco SMS (+92)', desc: 'Direct Pakistani Telco' },
                    { id: 'whatsapp', label: 'WhatsApp Alert', desc: 'Business Messaging' }
                  ].map((ch) => {
                    const isChecked = channels.includes(ch.id as NotificationDeliveryChannel);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id as NotificationDeliveryChannel)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition select-none ${
                          isChecked
                            ? 'border-amber-400 bg-amber-50/50 text-slate-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{ch.label}</span>
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${isChecked ? 'bg-amber-500 text-white' : 'border border-slate-300'}`}>
                            {isChecked && '✓'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{ch.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Notification Title (English) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Account KYC Approved / Rain Surge Active"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Title (Urdu)</span>
                    <span className="text-[10px] text-slate-400 font-normal">اردو عنوان</span>
                  </label>
                  <input
                    type="text"
                    value={titleUrdu}
                    onChange={(e) => setTitleUrdu(e.target.value)}
                    placeholder="مثال: اکاؤنٹ کی تصدیق منظور کر لی گئی ہے"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-urdu focus:ring-2 focus:ring-amber-400 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Placeholders Helper Bar */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Insert Variables:
                </span>
                {[
                  '{driverName}',
                  '{passengerName}',
                  '{rideId}',
                  '{amount}',
                  '{city}',
                  '{date}',
                  '{reason}'
                ].map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => handleInsertPlaceholder(ph)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-mono text-[10px] border border-slate-200 transition cursor-pointer"
                  >
                    + {ph}
                  </button>
                ))}
              </div>

              {/* Message Body Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Notification Message (English) *</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type official notification message here..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Message Body (Urdu)</span>
                    <span className="text-[10px] text-slate-400 font-normal">پیغام کی تفصیل</span>
                  </label>
                  <textarea
                    rows={4}
                    value={messageUrdu}
                    onChange={(e) => setMessageUrdu(e.target.value)}
                    placeholder="پیغام کا مکمل متن اردو میں درج کریں..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-urdu focus:ring-2 focus:ring-amber-400 text-right resize-none"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Optional Schedule */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isScheduleEnabled}
                    onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span>Schedule for later delivery</span>
                </label>

                {isScheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
                  />
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setMessage('');
                    setTitleUrdu('');
                    setMessageUrdu('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Clear Form
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isScheduleEnabled ? 'Schedule Dispatch' : 'Dispatch Notification Now'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Device Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Live Mobile Lockscreen Preview</span>
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">
                  Android / iOS
                </span>
              </div>

              {/* Mock Phone Frame */}
              <div className="w-full rounded-2xl bg-slate-950 p-4 text-white shadow-lg relative border border-slate-800">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 px-1">
                  <span>18:30</span>
                  <span className="text-emerald-400 font-bold">GoLife 4G • 98%</span>
                </div>

                {/* Notification Card */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        G
                      </div>
                      <span className="text-[11px] font-bold text-amber-400">GoLife Taxi</span>
                    </div>
                    <span className="text-[9px] text-slate-400">Just now</span>
                  </div>

                  <h5 className="text-xs font-bold text-white leading-tight">
                    {title || 'Sample Notification Title'}
                  </h5>

                  {titleUrdu && (
                    <p className="text-[11px] text-amber-200/90 font-urdu leading-tight text-right" dir="rtl">
                      {titleUrdu}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {message || 'This is a preview of how your message will appear on drivers and passengers phones.'}
                  </p>

                  {messageUrdu && (
                    <p className="text-[11px] text-slate-300 font-urdu leading-snug text-right border-t border-slate-800/80 pt-1" dir="rtl">
                      {messageUrdu}
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-center text-slate-500 mt-4">
                  Slide or tap notification to open GoLife app
                </div>
              </div>

              {/* Delivery info summary */}
              <div className="mt-3.5 space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Audience:</span>
                  <span className="font-bold text-slate-800 capitalize">{recipientType.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Priority:</span>
                  <span className="font-bold text-slate-800 capitalize">{priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Channels:</span>
                  <span className="font-bold text-slate-800">{channels.length} selected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: REUSABLE TEMPLATES MANAGEMENT
         ======================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Pre-Configured Pakistani Transport Templates</h3>
              <p className="text-xs text-slate-500">
                Bilingual templates with auto-replacement placeholders for KYC, fines, suspensions, refunds, and weather
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setTemplateName('');
                setTemplateTitle('');
                setTemplateTitleUrdu('');
                setTemplateMessage('');
                setTemplateMessageUrdu('');
                setTemplatePriority('normal');
                setTemplateAudience('driver');
                setShowTemplateModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition shadow-2xs flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                      {tmpl.type.replace('_', ' ')}
                    </span>
                    {getPriorityBadge(tmpl.priority)}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                    {tmpl.name}
                  </h4>

                  <p className="text-[11px] font-semibold text-slate-800">
                    {tmpl.title}
                  </p>

                  {tmpl.titleUrdu && (
                    <p className="text-[11px] text-slate-600 font-urdu text-right" dir="rtl">
                      {tmpl.titleUrdu}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-snug line-clamp-3">
                    {tmpl.message}
                  </p>

                  {/* Placeholders badges */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {tmpl.placeholders.map((ph) => (
                      <span key={ph} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {ph}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyTemplate(tmpl.id);
                      setActiveTabLocal('compose');
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Use in Composer</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTemplate(tmpl)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNotificationTemplate(tmpl.id)}
                      className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: AUTOMATED NOTIFICATION TRIGGERS
         ======================================================== */}
      {activeTab === 'triggers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950">Active System Event Triggers</h3>
            <p className="text-xs text-slate-500">
              The following platform lifecycle events automatically generate and deliver push notifications in real time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: 'Driver KYC Verification Approved',
                event: 'DRIVER_VERIFICATION_APPROVED',
                category: 'driver_verification',
                target: 'Driver Partner',
                channels: 'In-App + Push FCM + SMS',
                description: 'Sent immediately when Super Admin or Verification Officer clicks "Approve" on documents in KYC Verification Queue.'
              },
              {
                title: 'Driver KYC Verification Rejected',
                event: 'DRIVER_VERIFICATION_REJECTED',
                category: 'driver_verification',
                target: 'Driver Partner',
                channels: 'In-App + Push FCM + SMS',
                description: 'Sent with specific rejection reason (e.g. blurred CNIC, expired license) prompting re-upload via driver app.'
              },
              {
                title: 'Compliance Fine Levied',
                event: 'DRIVER_FINE_LEVIED',
                category: 'fine',
                target: 'Driver Partner',
                channels: 'In-App + Push FCM + SMS',
                description: 'Sent when an automatic or manual fine is charged with amount, infraction reason, and 48-hour appeal notice.'
              },
              {
                title: 'Dispatch Account Suspension',
                event: 'DRIVER_SUSPENDED',
                category: 'suspension',
                target: 'Driver Partner',
                channels: 'In-App + Push FCM + SMS',
                description: 'Triggered upon manual or automatic 5-late-pickups suspension with duration in hours and academy review link.'
              },
              {
                title: 'Wallet Payout Processed',
                event: 'PAYOUT_COMPLETED',
                category: 'payout',
                target: 'Driver Partner',
                channels: 'In-App + Push FCM + SMS',
                description: 'Sent when finance admin approves EasyPaisa, JazzCash, or Raast withdrawal with banking reference number.'
              },
              {
                title: 'Passenger Fare Refund Credited',
                event: 'PASSENGER_REFUND_CREDITED',
                category: 'refund',
                target: 'Passenger',
                channels: 'In-App + Push FCM',
                description: 'Sent when fare dispute or cancellation compensation is added to passenger wallet balance.'
              },
              {
                title: 'Ride Cancellation Penalty / Fee',
                event: 'RIDE_CANCELLED_COMPENSATION',
                category: 'ride',
                target: 'Driver / Passenger',
                channels: 'In-App + Push FCM',
                description: 'Sent to driver when passenger cancels after arrival, crediting compensation fee to driver account.'
              },
              {
                title: 'Safety SOS Divergence Cleared',
                event: 'SAFETY_INCIDENT_RESOLVED',
                category: 'safety',
                target: 'Passenger / Emergency Contact',
                channels: 'In-App + Push FCM + Hotline Call',
                description: 'Dispatched when emergency ops team confirms passenger well-being after accidental or route divergence alert.'
              }
            ].map((trigger, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {trigger.event}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Hook
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{trigger.title}</h4>
                <p className="text-xs text-slate-600">{trigger.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Target: <strong className="text-slate-800">{trigger.target}</strong></span>
                  <span className="font-semibold text-amber-800">{trigger.channels}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: PUSH NOTIFICATION ARCHITECTURE & FCM ADAPTERS
         ======================================================== */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950">Multi-Channel Communication Adapters</h3>
            <p className="text-xs text-slate-500">
              Multi-channel push architecture supporting Firebase Cloud Messaging (FCM), Telco SMS, and In-App persistence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FCM Adapter Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                    FCM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Firebase Cloud Messaging</h4>
                    <span className="text-[10px] text-slate-400">Android & iOS Push Notifications</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Demo Simulated • FCM Ready
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Ready to accept production Firebase Server Service Account tokens. Dispatches silent background sync and visible heads-up notification cards to Pakistani driver and rider apps.
              </p>
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 font-mono">
                <div>Topic: /topics/golife_drivers_pk</div>
                <div>Topic: /topics/golife_passengers_pk</div>
                <div>Payload Priority: HIGH (Urgent wakeup)</div>
              </div>
            </div>

            {/* Pakistan Telco SMS Adapter Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-xs">
                    SMS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pakistan Telco SMS Gateway</h4>
                    <span className="text-[10px] text-slate-400">Jazz, Telenor, Zong & Ufone Direct</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                  Masking: GOLIFE
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Sends branded 160-character alphanumeric masked SMS (+92) for OTPs, KYC approvals, and urgent safety route warnings to feature phones and offline drivers.
              </p>
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 font-mono">
                <div>Sender ID: GoLifeTaxi</div>
                <div>Encoding: UTF-8 (Urdu Nastaliq + English)</div>
                <div>Latency SLA: &lt; 2.5 seconds</div>
              </div>
            </div>

            {/* In-App Store Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                    APP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">In-App Notification Feed</h4>
                    <span className="text-[10px] text-slate-400">Firestore Collections Persistence</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Real-time collection feed subscribed via Firestore listeners in driver and passenger app shells. Maintains read/unread states, badges, and link taps.
              </p>
            </div>

            {/* WhatsApp Business Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Business Cloud API</h4>
                    <span className="text-[10px] text-slate-400">Verified Pakistan Business Account</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Dispatches formal receipts, monthly withholding tax certificates, and customer dispute resolution letters directly to verified Pakistani mobile numbers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL BEFORE DISPATCH
         ======================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-950">Confirm Notification Broadcast</h4>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Target Audience:</span>
                <span className="font-bold text-slate-900 capitalize">{recipientType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Category & Priority:</span>
                <span className="font-bold text-slate-900 capitalize">{notifType} • {priority}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Active Channels:</span>
                <span className="font-bold text-slate-900">{channels.join(', ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-950">{title}</div>
                <div className="text-slate-600 mt-1 line-clamp-2">{message}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TEMPLATE MODAL (CREATE / EDIT)
         ======================================================== */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-950">
                {editingTemplate ? 'Edit Notification Template' : 'Create New Reusable Template'}
              </h4>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. KYC Approval Notice"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Type</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="driver_verification">Driver Verification</option>
                    <option value="document_expiry">Document Expiry</option>
                    <option value="fine">Fine / Penalty</option>
                    <option value="suspension">Suspension</option>
                    <option value="payout">Payout</option>
                    <option value="refund">Refund</option>
                    <option value="ride">Ride Notice</option>
                    <option value="safety">Safety Notice</option>
                    <option value="promotional">Promotional</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Audience</label>
                  <select
                    value={templateAudience}
                    onChange={(e) => setTemplateAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="driver">Drivers Only</option>
                    <option value="passenger">Passengers Only</option>
                    <option value="both">Both Drivers & Passengers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">English Title *</label>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="e.g. Notice: Rs. {amount} fine levied"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Urdu Title</label>
                <input
                  type="text"
                  value={templateTitleUrdu}
                  onChange={(e) => setTemplateTitleUrdu(e.target.value)}
                  placeholder="اردو عنوان"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-urdu text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">English Message *</label>
                <textarea
                  rows={3}
                  value={templateMessage}
                  onChange={(e) => setTemplateMessage(e.target.value)}
                  placeholder="Use {driverName}, {passengerName}, {amount}, {rideId} as variables..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Urdu Message</label>
                <textarea
                  rows={3}
                  value={templateMessageUrdu}
                  onChange={(e) => setTemplateMessageUrdu(e.target.value)}
                  placeholder="اردو میں پیغام..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-urdu text-right resize-none"
                  dir="rtl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MOBILE PREVIEW MODAL FOR SPECIFIC NOTIFICATION
         ======================================================== */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Phone Preview</span>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="w-full rounded-2xl bg-slate-950 p-4 text-white shadow-md border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>12:00</span>
                <span className="text-emerald-400 font-bold">GoLife 4G</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    G
                  </div>
                  <span className="text-[11px] font-bold text-amber-400">GoLife Taxi</span>
                  <span className="text-[9px] text-slate-400 ml-auto">
                    {selectedNotification.sentAt || 'Now'}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white">
                  {selectedNotification.title}
                </h5>

                {selectedNotification.titleUrdu && (
                  <p className="text-[11px] text-amber-200 font-urdu text-right" dir="rtl">
                    {selectedNotification.titleUrdu}
                  </p>
                )}

                <p className="text-[11px] text-slate-300 leading-snug">
                  {selectedNotification.message}
                </p>

                {selectedNotification.messageUrdu && (
                  <p className="text-[11px] text-slate-300 font-urdu text-right border-t border-slate-800 pt-1" dir="rtl">
                    {selectedNotification.messageUrdu}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
