import React from 'react';
import { useKeydown } from '../../hooks';
import styles from './SettingsMenu.css'; // eslint-disable-line

export default function Menu(props) {
  useKeydown('Escape', () => props.showMenu && props.handleModalClose());
  const handleDelete = e => {
    e.preventDefault();
    const deleteConfirm = window.confirm(
      'Are you sure you want to clear all completed todos?'
    );
    if (deleteConfirm) {
      console.log('delete');
      props.handleClearCompleted();
    }
  };

  const { showMenu } = props;
  const showOrHide = showMenu ? 'flex' : 'none';
  return (
    <div className="settings-wrapper" style={{ display: showOrHide }}>
      <div className="settings-content">
        <span
          className="settings-close"
          onClick={props.handleModalClose}
          role="img"
          aria-label="close"
        >
          ❌
        </span>
        <h2>Settings</h2>
        <div className="settings-section" onClick={handleDelete}>
          <button className="btn-danger">Clear All Completed Todos</button>
        </div>
        {/* <div className='settings-section' style={{display: 'none'}}>
            <div className='settings-header'>Sort Todos:</div>
            <div className='settings-options-wrapper' data-setting='sortOrder'>
              <div
                className='settings-option'
                onClick={this.changeSetting}
                data-value='desc'>
                Oldest First ▼
              </div>
              <div
                className='settings-option'
                onClick={this.changeSetting}
                data-value='asc'>
                Most Recent First ▲
              </div>
            </div>
          </div> */}
      </div>
    </div>
  );
}
