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

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

function getItemDataTestId(itemId) {
    return itemId.split('|')[0];
}

const NavigationLink = ({ item, activeItemId, onClick }) => {
    return (
        <div
            key={'navAction_' + item.id}
            className={classnames('navigation-group-item-name', {
                selected: item.id === activeItemId,
                disabled: item.disabled,
                'bold-name': item.expanded,
                hidden: item.hidden
            })}
            onClick={event => onClick(event, item)}
            data-test-id={'navbar-group-item-' + getItemDataTestId(item.id)}>
            {item.name}
        </div>
    );
};

NavigationLink.propTypes = {
    item: PropTypes.object,
    activeItemId: PropTypes.string,
    onClick: PropTypes.func
};

export default NavigationLink;
