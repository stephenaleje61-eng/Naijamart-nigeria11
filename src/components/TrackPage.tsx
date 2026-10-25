import React from 'react';
import { SelfTrackingPage } from './SelfTrackingPage';

interface TrackPageProps {
  onNavigate?: (route: string) => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({ onNavigate }) => {
  return <SelfTrackingPage onNavigate={onNavigate || (() => {})} />;
};

export default TrackPage;
