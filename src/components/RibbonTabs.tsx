import React from 'react';
import { ActiveTab } from '../types';

interface RibbonTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenOptions: () => void;
  onOpenRecordings: () => void;
  onOpenHelp: () => void;
}

export const RibbonTabs: React.FC<RibbonTabsProps> = ({
  activeTab,
  onSelectTab,
  onOpenOptions,
  onOpenRecordings,
  onOpenHelp,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="bg-[#1e1e1e] flex items-center justify-between border-b border-[#2d2d2d] px-2 pt-1 relative z-30 select-none">
      {/* Left tabs with green Menu button */}
      <div className="flex items-center space-x-1">
        {/* Authentic Green Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-1 bg-[#107c41] hover:bg-[#0e6b37] text-white px-2.5 py-1 rounded-t text-xs font-semibold shadow transition-colors"
          >
            <span>☰</span>
            <span>Menu</span>
            <span className="text-[9px]">▼</span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full mt-0.5 w-48 bg-[#2d2d2d] border border-[#444] rounded shadow-2xl py-1 text-slate-200 z-50 text-xs">
              <button
                onClick={() => { onOpenRecordings(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white"
              >
                Recordings
              </button>
              <button
                onClick={() => { onOpenOptions(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white"
              >
                Options
              </button>
              <button
                onClick={() => { onOpenHelp(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#107c41] hover:text-white"
              >
                Help & Documentation
              </button>
            </div>
          )}
        </div>

        {/* Home Tab */}
        <button
          onClick={() => onSelectTab('home')}
          className={`px-3 py-1 text-xs rounded-t font-medium transition-colors ${
            activeTab === 'home'
              ? 'bg-[#2b2b2b] text-white border-t-2 border-t-[#22c55e]'
              : 'text-slate-300 hover:bg-[#262626] hover:text-white'
          }`}
        >
          Home
        </button>

        {/* Effects Tab */}
        <button
          onClick={() => onSelectTab('effects')}
          className={`px-3 py-1 text-xs rounded-t font-medium transition-colors ${
            activeTab === 'effects'
              ? 'bg-[#2b2b2b] text-white border-t-2 border-t-[#22c55e]'
              : 'text-slate-300 hover:bg-[#262626] hover:text-white'
          }`}
        >
          Effects
        </button>

        {/* Options Tab */}
        <button
          onClick={() => onSelectTab('options')}
          className={`px-3 py-1 text-xs rounded-t font-medium transition-colors ${
            activeTab === 'options'
              ? 'bg-[#2b2b2b] text-white border-t-2 border-t-[#22c55e]'
              : 'text-slate-300 hover:bg-[#262626] hover:text-white'
          }`}
        >
          Options
        </button>

        {/* Help Tab */}
        <button
          onClick={() => onSelectTab('help')}
          className={`px-3 py-1 text-xs rounded-t font-medium transition-colors ${
            activeTab === 'help'
              ? 'bg-[#2b2b2b] text-white border-t-2 border-t-[#22c55e]'
              : 'text-slate-300 hover:bg-[#262626] hover:text-white'
          }`}
        >
          Help
        </button>

        {/* Suite Tab */}
        <button
          onClick={() => onSelectTab('suite')}
          className={`px-3 py-1 text-xs rounded-t font-medium transition-colors ${
            activeTab === 'suite'
              ? 'bg-[#2b2b2b] text-white border-t-2 border-t-[#22c55e]'
              : 'text-slate-300 hover:bg-[#262626] hover:text-white'
          }`}
        >
          Suite
        </button>
      </div>

      {/* Right Social & Help Action Icons */}
      <div className="flex items-center space-x-1 pb-1">
        {/* Thumbs up */}
        <div
          title="Recommend GNOA"
          className="w-5 h-5 bg-[#3a5897] hover:bg-[#466ab7] rounded text-white flex items-center justify-center text-[11px] cursor-pointer shadow-sm"
        >
          👍
        </div>
        {/* Facebook */}
        <div
          title="Facebook"
          className="w-5 h-5 bg-[#3b5998] hover:bg-[#4a6ebb] rounded text-white font-bold flex items-center justify-center text-xs cursor-pointer shadow-sm"
        >
          f
        </div>
        {/* Twitter */}
        <div
          title="Twitter"
          className="w-5 h-5 bg-[#1da1f2] hover:bg-[#2cb0ff] rounded text-white font-bold flex items-center justify-center text-[10px] cursor-pointer shadow-sm"
        >
          𝕏
        </div>
        {/* LinkedIn */}
        <div
          title="LinkedIn"
          className="w-5 h-5 bg-[#0077b5] hover:bg-[#028ad0] rounded text-white font-bold flex items-center justify-center text-[10px] cursor-pointer shadow-sm"
        >
          in
        </div>
        {/* Help Question mark */}
        <div
          onClick={onOpenHelp}
          title="Help & Support"
          className="w-5 h-5 bg-[#0284c7] hover:bg-[#0396e3] rounded-full text-white font-bold flex items-center justify-center text-xs cursor-pointer shadow-sm"
        >
          ?
        </div>
      </div>
    </div>
  );
};
