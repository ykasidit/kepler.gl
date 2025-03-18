// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React, { useCallback, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import styled, { ThemeProvider, StyleSheetManager } from 'styled-components';
import Window from 'global/window';
import { connect, useDispatch } from 'react-redux';
import isPropValid from '@emotion/is-prop-valid';

import { panelBorderColor, theme } from '@kepler.gl/styles';
import { useSelector } from 'react-redux';
import { MinSavedConfigV1, ParsedConfig } from '@kepler.gl/types';
import { getApplicationConfig } from '@kepler.gl/utils';
import { SqlPanel } from '@kepler.gl/duckdb';
import Banner from './components/banner';
import Announcement, { FormLink } from './components/announcement';
import { replaceLoadDataModal } from './factories/load-data-modal';
import { replaceMapControl } from './factories/map-control';
import { replacePanelHeader } from './factories/panel-header';
import { CLOUD_PROVIDERS_CONFIGURATION, DEFAULT_FEATURE_FLAGS } from './constants/default-settings';


import {
  addDataToMap,
  toggleMapControl,
  toggleModal
} from '@kepler.gl/actions';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const KeplerGl = require('@kepler.gl/components').injectComponents([
  replaceLoadDataModal(),
  replaceMapControl(),
  replacePanelHeader()
]);

// Sample data
/* eslint-disable no-unused-vars */
// import sampleGeojson from './data/sample-small-geojson';
import sampleGeojsonPoints from './data/sample-geojson-points';
import sampleGeojsonConfig from './data/sample-geojson-config';
import { processArrowTable, processGeojson } from '@kepler.gl/processors';
import { ParquetWasmLoader } from '@loaders.gl/parquet';

/* eslint-enable no-unused-vars */

// This implements the default behavior from styled-components v5
function shouldForwardProp(propName, target) {
  if (typeof target === 'string') {
    // For HTML elements, forward the prop if it is a valid HTML attribute
    return isPropValid(propName);
  }
  // For other elements, forward all props
  return true;
}

const BannerHeight = 48;
const BannerKey = `banner-${FormLink}`;
const keplerGlGetState = state => state.demo.keplerGl;

const GlobalStyle = styled.div`
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.labelColor};
  }
`;

const CONTAINER_STYLE = {
  transition: 'margin 1s, height 1s',
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#333'
};

const StyledResizeHandle = styled(PanelResizeHandle)`
  background-color: ${panelBorderColor};
  &:hover {
    background-color: #555;
  }
  width: 100%;
  height: 5px;
  cursor: row-resize;
`;

const App = props => {
  const [showBanner, toggleShowBanner] = useState(false);
  const { params: { id, provider } = {}, location: { query = {} } = {} } = props;
  const dispatch = useDispatch();

  // TODO find another way to check for existence of duckDb plugin
  const duckDbPluginEnabled = (getApplicationConfig().plugins || []).some(p => p.name === 'duckdb');

  const isSqlPanelOpen = useSelector(
    state => duckDbPluginEnabled && state?.demo?.keplerGl?.map?.uiState.mapControls.sqlPanel?.active
  );
  const prevQueryRef = useRef<number>(null);

  useEffect(() => {
    if (duckDbPluginEnabled && query.sql) {
      dispatch(toggleMapControl('sqlPanel', 0));
      dispatch(toggleModal(null));
    }
  }, []);

  /*
  const _showBanner = useCallback(() => {
    toggleShowBanner(true);
  }, [toggleShowBanner]);
  */

  const hideBanner = useCallback(() => {
    toggleShowBanner(false);
  }, [toggleShowBanner]);

  const _disableBanner = useCallback(() => {
    hideBanner();
    Window.localStorage.setItem(BannerKey, 'true');
  }, [hideBanner]);

  const _loadParquet = useCallback(async (dataUrl: string, configUrl?: string) => {
    try {
      const data = await fetch(dataUrl)
      const bytes = await data.arrayBuffer()
      const parsedData = await ParquetWasmLoader.parse(bytes);
      const processedData = await processArrowTable(parsedData);
      if (!processedData) {
        return
      }
      let config: MinSavedConfigV1 | undefined = undefined;
      if (configUrl) {
        try {
          config = await (await fetch(configUrl)).json() as MinSavedConfigV1;
          const layers = config?.config?.visState?.layers ?? [];
          for (const layer of layers) {
            layer.id = makeid(6);
            layer.config.dataId = dataUrl;
          }
          const fieldsToShow = config?.config?.visState?.interactionConfig?.tooltip?.fieldsToShow ?? {};
          const fieldsToShowKeys = Object.keys(fieldsToShow);
          if (fieldsToShowKeys.length > 0) {
            const oldKey = fieldsToShowKeys[0];
            fieldsToShow[dataUrl] = fieldsToShow[oldKey];
            delete fieldsToShow[oldKey];
          }
        } catch (e) {
          console.error(e);
        }
      }
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: dataUrl,
              id: dataUrl
            },
            data: processedData
          },
          options: {
            keepExistingConfig: true
          },
          config: config,
        })
      );
      console.log(parsedData);
      console.log(config);
    } catch (e) {
      console.error(e)
    }

  }, [dispatch]);

  const _loadGeojsonData = useCallback(() => {
    // load geojson
    const geojsonPoints = processGeojson(sampleGeojsonPoints);
    const geojsonZip = null; // processGeojson(sampleGeojson);
    dispatch(
      addDataToMap({
        datasets: [
          geojsonPoints
            ? {
              info: { label: 'Bart Stops Geo', id: 'bart-stops-geo' },
              data: geojsonPoints
            }
            : null,
          geojsonZip
            ? {
              info: { label: 'SF Zip Geo', id: 'sf-zip-geo' },
              data: geojsonZip
            }
            : null
        ].filter(d => d !== null),
        options: {
          keepExistingConfig: true
        },
        config: sampleGeojsonConfig as ParsedConfig
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const { dataUrl, themeUrl } = query;
    if (!dataUrl) {
      return;
    }
    if ((dataUrl as string).endsWith(".parquet")) {
      console.log(themeUrl)
      _loadParquet(dataUrl, themeUrl);
    }

  }, [query])

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <GlobalStyle
        // this is to apply the same modal style as kepler.gl core
        // because styled-components doesn't always return a node
        // https://github.com/styled-components/styled-components/issues/617
        // ref={node => {
        //   node ? (this.root = node) : null;
        // }}
        >
          <Banner show={showBanner} height={BannerHeight} bgColor="#2E7CF6" onClose={hideBanner}>
            <Announcement onDisable={_disableBanner} />
          </Banner>
          <div style={CONTAINER_STYLE}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={isSqlPanelOpen ? 60 : 100}>
                <AutoSizer>
                  {({ height, width }) => (
                    <KeplerGl
                      mapboxApiAccessToken={CLOUD_PROVIDERS_CONFIGURATION.MAPBOX_TOKEN}
                      id="map"
                      getState={keplerGlGetState}
                      width={width}
                      height={height}
                      featureFlags={DEFAULT_FEATURE_FLAGS}
                    />
                  )}
                </AutoSizer>
              </Panel>

              {isSqlPanelOpen && (
                <>
                  <StyledResizeHandle />
                  <Panel defaultSize={40} minSize={20}>
                    <SqlPanel initialSql={query.sql || ''} />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </div>
        </GlobalStyle>
      </ThemeProvider>
    </StyleSheetManager>
  );
};

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(App);

function makeid(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}