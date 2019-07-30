import { css } from 'lit-element';

import sharedStyles from './shared-styles';

export default [
  sharedStyles,
  css`
    .logBox {
      margin-top: 16px;
      width: 400px;
      height: 500px;
      border-radius: 6px;
      border: 1px solid black;
      box-shadow: 4px 4px 2px black;
    }

    .logHeader {
      margin: 0;
      padding: 0 6px 4px;
      height: 22px;
      background-color: lightblue;
      border-bottom: 1px solid black;
      border-radius: 6px 6px 0 0;
    }

    #log {
      font: 12px 'Courier', monospace;
      padding: 6px;
      overflow: auto;
      overflow-y: scroll;
      width: 388px;
      height: 460px;
    }

    .container {
      width: 400px;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid black;
      box-shadow: 4px 4px 2px black;
      display: block;
      overflow: auto;
    }

    .label {
      display: inline-block;
    }

    .counter {
      text-align: right;
      padding-top: 4px;
      float: right;
    }

    .button {
      padding-top: 2px;
      padding-bottom: 4px;
      width: 100px;
      display: inline-block;
      float: left;
      border: 1px solid black;
      cursor: pointer;
      text-align: center;
      margin-top: 0;
      color: white;
      background-color: darkgreen;
    }

    #progress {
      width: 100%;
      padding-top: 6px;
    }
  `
];
