/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
 *      http://www.apache.org/licenses/LICENSE-2.0
*
 * Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Notification } from 'sdc-ui/lib/react/';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export default class NotificationsView extends PureComponent {
    static propTypes = {
        removeNotifications: PropTypes.func,
        notifications: PropTypes.array
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { notifications, removeNotifications } = this.props;
        return (
            <div className="workflow-notifications-container position-top-right">
                <TransitionGroup>
                    {notifications.map(item => (
                        <CSSTransition
                            in={true}
                            timeout={500}
                            unmountOnExit
                            classNames="react-transition"
                            key={`notification-transition-${item.id}`}>
                            <Notification
                                key={item.id}
                                type={item.type}
                                title={item.title}
                                message={item.message}
                                onClick={() => removeNotifications(item)}
                            />
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </div>
        );
    }
}
