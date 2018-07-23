/*!
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NavigationMenu from './NavigationMenu';

class NavigationSideBar extends Component {
    static propTypes = {
        activeItemId: PropTypes.string,
        onSelect: PropTypes.func,
        onToggle: PropTypes.func,
        groups: PropTypes.array,
        disabled: PropTypes.bool,
        onNavigationItemClick: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            activeItemId: null
        };
        this.handleItemClicked = this.handleItemClicked.bind(this);
    }

    render() {
        let { groups, activeItemId, disabled = false } = this.props;

        return (
            <div
                className={`navigation-side-content ${
                    disabled ? 'disabled' : ''
                }`}>
                {groups.map(group => (
                    <NavigationMenu
                        menu={group}
                        activeItemId={activeItemId}
                        onNavigationItemClick={this.handleItemClicked}
                        key={'menu_' + group.id}
                    />
                ))}
            </div>
        );
    }

    handleItemClicked(event, item) {
        event.stopPropagation();
        if (this.props.onToggle) {
            this.props.onToggle(this.props.groups, item.id);
        }
        if (item.onSelect) {
            item.onSelect();
        }
        if (this.props.onSelect) {
            this.props.onSelect(item);
        }
    }
}

export default NavigationSideBar;
