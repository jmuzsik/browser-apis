import { css } from 'lit-element';

export default css`
  :host {
    display: block;
  }

  app-header {
    width: 100%;
    text-align: center;
    background-color: var(--app-header-background-color);
    color: var(--app-header-text-color);
    border-bottom: 1px solid #eee;
  }

  .toolbar-top {
    background-color: var(--app-header-background-color);
  }

  [main-title] {
    font-family: 'Pacifico';
    text-transform: lowercase;
    font-size: 30px;
    /* In the narrow layout, the toolbar is offset by the width of the
    drawer button, and the text looks not centered. Add a padding to
    match that button */
    padding-right: 44px;
  }

  .toolbar-list {
    display: none;
  }

  .toolbar-list > a {
    display: inline-block;
    color: var(--app-header-text-color);
    text-decoration: none;
    line-height: 30px;
    padding: 4px 24px;
  }

  .toolbar-list > a[selected] {
    color: var(--app-header-selected-color);
    border-bottom: 4px solid var(--app-header-selected-color);
  }

  .menu-btn {
    background: none;
    border: none;
    fill: var(--app-header-text-color);
    cursor: pointer;
    height: 44px;
    width: 44px;
  }

  .drawer-list {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 24px;
    background: var(--app-drawer-background-color);
    position: relative;
  }

  .drawer-list > a {
    display: block;
    text-decoration: none;
    color: var(--app-drawer-text-color);
    line-height: 40px;
    padding: 0 24px;
  }

  .drawer-list > a[selected] {
    color: var(--app-drawer-selected-color);
  }

  /* Workaround for IE11 displaying <main> as inline */
  main {
    display: block;
  }

  .main-content {
    min-height: 100vh;
  }

  .page {
    display: none;
  }

  .page[active] {
    display: block;
  }

  footer {
    padding: 24px;
    background: var(--app-drawer-background-color);
    color: var(--app-drawer-text-color);
    text-align: center;
  }

  /* Wide layout: when the viewport width is bigger than 460px, layout
  changes to a wide layout */
  @media (min-width: 460px) {
    .toolbar-list {
      display: block;
    }

    .menu-btn {
      display: none;
    }

    /* The drawer button isn't shown in the wide layout, so we don't
    need to offset the title */
    [main-title] {
      padding-right: 0px;
    }
  }
  code {
    color: #005cc5;
  }
`;
