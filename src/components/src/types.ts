// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, {HTMLAttributes, PropsWithChildren} from 'react';
import {MapStyle} from '@kepler.gl/reducers';
import {Layer, LayerClassesType} from '@kepler.gl/layers';
import {Filter, InteractionConfig, MapState, UiState} from '@kepler.gl/types';

import {
  MapStyleActions,
  VisStateActions,
  MapStateActions,
  UIStateActions
} from '@kepler.gl/actions';
import {Datasets} from '@kepler.gl/table';
import { VisState } from '@kepler.gl/schemas';

export type BaseComponentProps = PropsWithChildren<HTMLAttributes<unknown>>;

export type SidePanelItem = {
  id: string;
  label: string;
  iconComponent: React.ComponentType<any>;
  component: React.ComponentType<any>;
};

export type SidePanelProps = {
  appName: string;
  appWebsite: string;
  filters: Filter[];
  interactionConfig: InteractionConfig;
  layerBlending: string;
  overlayBlending?: string;
  layers: Layer[];
  layerClasses: LayerClassesType;
  layerOrder: string[];
  mapStyle: MapStyle;
  mapInfo: {title?: string; description?: string};
  width: number;
  datasets: Datasets;
  uiStateActions: typeof UIStateActions;
  visState: VisState;
  visStateActions: typeof VisStateActions;
  mapState: MapState;
  mapStateActions: typeof MapStateActions;
  mapStyleActions: typeof MapStyleActions;
  uiState: UiState;
  availableProviders: {[k: string]: {hasShare?: boolean; hasStorage?: boolean}};
  mapSaved?: string | null;
  panels?: SidePanelItem[];
  onSaveMap?: () => void;
  version: string;
};
