import React, { Component } from 'react';
import G6, { EdgeConfig, NodeConfig } from '@antv/g6';
import api from '../../services/api.service';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

interface nodeConfig extends NodeConfig {
  fm_attributes: {
    type?: string;
    mandatory?: boolean;
    abstract?: boolean;
  };
  wasRendered?: boolean;
}

type State = {
  json: {};
};

export default class FileShow extends Component<Props, State> {
  ref: React.RefObject<HTMLDivElement>;

  graph: any;

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = { json: {} };
    const url = window.location.pathname;
    const id = url.substring(url.lastIndexOf('/') + 1);
    this.ref = React.createRef();

    api.get(`${API_URL}files/${id}/`).then((response) => {
      api.get(`${response.data.transpiled_file}`).then((file) => {
        this.state = { json: file.data };

        if (!this.graph) {
          const defaultRankSep = 180;
          const defaultFontSize = 11;
          const defaultNodeSize = [20, 20];
          const treeDir = 'TB'; // H / V / LR / RL / TB / BT
          const strokeColor = '#a2a2a2';
          const concreteNodeColor = '#ccccff';
          const abstractNodeColor = '#f2f2ff';
          this.graph = new G6.TreeGraph({
            container: 'graph-container',
            linkCenter: true,
            fitView: true,
            modes: {
              default: [
                {
                  type: 'collapse-expand',
                  enableDelegate: true,
                  trigger: 'click',
                  // prevent collapsing/expanding on leaf nodes
                  shouldBegin: (e) => {
                    if (e.item) {
                      const children = e.item.getModel().children as {
                        length: number;
                      };
                      if (children.length) return true;
                      return false;
                    }
                    return false;
                  },
                  relayout: true,
                },
                {
                  type: 'zoom-canvas',
                  enableOptimize: true,
                  // optimizeZoom: 0.9,
                },
                {
                  type: 'drag-canvas',
                  // enableOptimize: true, //do not show node label while dragging?
                },
              ],
            },
            defaultNode: {
              type: 'rect',
              size: defaultNodeSize, // default node size, will be overwritten later
              labelCfg: {
                style: {
                  fontSize: defaultFontSize,
                },
              },
              anchorPoints: [
                [0, 0.5],
                [1, 0.5],
              ],
              style: {
                fill: concreteNodeColor,
                stroke: strokeColor,
              },
            },
            defaultEdge: {
              type: 'cubic-vertical',
            },
            layout: {
              type: 'dendrogram',
              direction: treeDir,
              gpuEnabled: true,
              workerEnabled: true, // enable Web-Worker
              preventOverlap: true,
              nodeSep: 40,
              rankSep: defaultRankSep,
            },
          });
          let maxSep = defaultRankSep;
          this.graph.data(this.state.json);

          // customize nodes
          this.graph.node((node: nodeConfig) => {
            if (!node.wasRendered) {
              const fontSizeDuplicator = 7; // choosen via try and error
              // label position relative to node, options: center, top, bottom, left, right
              const labelPos = 'center';
              let rotate = 0;
              // resize node according to label length
              const newLabel = node.fm_attributes.type !== 'feature'
                ? `${node.fm_attributes.type} | ${node.id}`
                : node.id;
              const newWidth = (newLabel.length + 2) * fontSizeDuplicator;
              let size = [
                newWidth,
                typeof node.size === 'number'
                  ? node.size
                  : node.size
                    ? node.size[1]
                    : 0,
              ];

              if (treeDir === 'TB' && node.children && !node.children.length) {
                // labelPos = "bottom"; //pos for label of node
                rotate = Math.PI / 2;
                // interchange width and height
                size = [size[1], size[0]];
              }
              maxSep = newWidth > maxSep ? newWidth : maxSep;

              /* eslint-disable no-param-reassign */
              node.label = newLabel;
              node.size = size;
              node.wasRendered = true;
              if (node.style && node.labelCfg && node.labelCfg.style) {
                node.style.fill = node.fm_attributes.abstract
                  ? abstractNodeColor
                  : concreteNodeColor;
                node.style.stroke = strokeColor;

                node.labelCfg.position = labelPos;
                node.labelCfg.style.rotate = rotate;
                node.labelCfg.style.fontFamily = 'courier';
              }

              return node;
            }
            return node;
          });
          // customize edges
          // built in mandatory attributes: id, source, target, type
          // fm_attributes mandatory with field type (can be 'and', 'or', 'feautre', ...)
          // Note that, if fm_attributes.type == 'and' then there can be a new attribute 'mandatory'
          // more: https://g6.antv.vision/en/docs/manual/middle/elements/edges/defaultEdge#the-common-property
          this.graph.edge((edge: EdgeConfig) => {
            let parent = this.graph.findById(edge.source);
            const currentDepth = this.graph
              .findById(edge.source)
              .get('model').depth;
            // collapse subtrees on depth level 2
            // https://g6.antv.vision/en/docs/manual/middle/states/defaultBehavior#collapse-expand
            if (currentDepth === 2) {
              const newModel = this.graph.findById(edge.source).get('model');
              // do this only on init, means collapse is undefined
              if (newModel.collapsed === undefined) {
                newModel.collapsed = true;
                this.graph.updateItem(parent, newModel);
              }
            }
            const child = this.graph.findById(edge.target).get('model');
            parent = this.graph.findById(edge.source).get('model');
            const newEndArrow = {
              fill: child.fm_attributes.mandatory ? '#000000' : '#ffffff',
              path: G6.Arrow.circle(4, 8), // radius, offset
              d: 5,
            };
            switch (parent.fm_attributes.type) {
              case 'and':
                // add and color mandatory circle accordingly
                if (!edge.style) {
                  edge.style = {};
                }
                edge.style.endArrow = newEndArrow;
                return edge;
              default:
                return edge;
            }
          });
        }
        /* eslint-enable no-param-reassign */
        this.graph.layout();
        this.graph.render();
      });
    });
  }

  render() {
    return <div id="graph-container" />;
  }
}
