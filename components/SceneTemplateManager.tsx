'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelBookStore, SceneTemplate } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

interface SceneTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateApplied?: () => void;
}

const SceneTemplateManager: React.FC<SceneTemplateManagerProps> = ({ isOpen, onClose, onTemplateApplied }) => {
  const { currentBook, sceneTemplates, saveSceneAsTemplate, applySceneTemplate, deleteSceneTemplate } = useTravelBookStore();
  const { language } = useLanguageStore();
  const t = (key: string) => getTranslation(key, language);

  const [activeTab, setActiveTab] = useState<'saved' | 'apply'>('saved');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [newSceneName, setNewSceneName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const scenes = currentBook?.scenes || [];

  // 保存场景为模板
  const handleSaveTemplate = () => {
    if (!selectedSceneId || !templateName.trim()) return;
    
    saveSceneAsTemplate(selectedSceneId, templateName.trim(), templateDescription.trim());
    setTemplateName('');
    setTemplateDescription('');
    setSelectedSceneId('');
  };

  // 应用场景模板
  const handleApplyTemplate = (templateId: string) => {
    if (!newSceneName.trim()) return;
    
    // 在世界地图上选择一个合适的位置（随机位置，实际应用中可能需要更智能的位置选择）
    const x = Math.random() * 600 + 100;
    const y = Math.random() * 300 + 100;
    
    applySceneTemplate(templateId, newSceneName.trim(), x, y);
    setNewSceneName('');
    onTemplateApplied?.();
    onClose();
  };

  // 确认删除模板
  const handleDeleteTemplate = (templateId: string) => {
    deleteSceneTemplate(templateId);
    setShowDeleteConfirm(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* 标题栏 */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">{t('sceneTemplates.managerTitle')}</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'saved' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('sceneTemplates.savedTemplates')}
              </button>
              <button
                onClick={() => setActiveTab('apply')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'apply' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('sceneTemplates.applyTemplate')}
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 保存场景为模板 */}
              {activeTab === 'saved' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">{t('sceneTemplates.saveAsTemplate')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          {t('sceneTemplates.selectScene')}
                        </label>
                        <select
                          value={selectedSceneId}
                          onChange={(e) => setSelectedSceneId(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                          <option value="">{t('sceneTemplates.chooseScene')}</option>
                          {scenes.map(scene => (
                            <option key={scene.id} value={scene.id}>
                              {scene.name} ({scene.pois.length} {t('sceneTemplates.pois')})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          {t('sceneTemplates.templateName')}
                        </label>
                        <input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder={t('sceneTemplates.templateNamePlaceholder')}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          {t('sceneTemplates.templateDescription')}
                        </label>
                        <textarea
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          placeholder={t('sceneTemplates.templateDescriptionPlaceholder')}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      
                      <button
                        onClick={handleSaveTemplate}
                        disabled={!selectedSceneId || !templateName.trim()}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('sceneTemplates.saveTemplate')}
                      </button>
                    </div>
                  </div>
                  
                  {/* 已保存的模板 */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">{t('sceneTemplates.savedTemplates')}</h3>
                    {sceneTemplates.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-3">
                          📋
                        </div>
                        <p>{t('sceneTemplates.noSavedTemplates')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sceneTemplates.map(template => (
                          <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:border-violet-300 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-slate-800">{template.name}</h4>
                              <button
                                onClick={() => setShowDeleteConfirm(template.id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            {template.description && (
                              <p className="text-sm text-slate-500 mb-3">{template.description}</p>
                            )}
                            <div className="text-sm text-slate-500 flex items-center">
                              <span className="mr-2">📌</span>
                              {template.samplePOIs.length} {t('sceneTemplates.pois')}
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                              {t('sceneTemplates.createdAt')} {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 应用场景模板 */}
              {activeTab === 'apply' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">{t('sceneTemplates.applyTemplate')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          {t('sceneTemplates.newSceneName')}
                        </label>
                        <input
                          type="text"
                          value={newSceneName}
                          onChange={(e) => setNewSceneName(e.target.value)}
                          placeholder={t('sceneTemplates.newSceneNamePlaceholder')}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">{t('sceneTemplates.availableTemplates')}</h3>
                    {sceneTemplates.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-3">
                          📋
                        </div>
                        <p>{t('sceneTemplates.noTemplatesToApply')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sceneTemplates.map(template => (
                          <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:border-violet-300 transition-colors">
                            <h4 className="font-medium text-slate-800 mb-2">{template.name}</h4>
                            {template.description && (
                              <p className="text-sm text-slate-500 mb-3">{template.description}</p>
                            )}
                            <div className="text-sm text-slate-500 flex items-center mb-3">
                              <span className="mr-2">📌</span>
                              {template.samplePOIs.length} {t('sceneTemplates.pois')}
                            </div>
                            <button
                              onClick={() => handleApplyTemplate(template.id)}
                              disabled={!newSceneName.trim()}
                              className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('sceneTemplates.apply')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 删除确认对话框 */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('sceneTemplates.deleteConfirm')}</h3>
                <p className="text-slate-600 mb-6">{t('sceneTemplates.deleteConfirmMessage')}</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {t('sceneTemplates.cancel')}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {t('sceneTemplates.delete')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default SceneTemplateManager;