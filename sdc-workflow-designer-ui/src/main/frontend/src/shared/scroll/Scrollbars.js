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

import React from 'react';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'perfect-scrollbar';

class Scrollbars extends React.Component {
    containerRef = React.createRef();
    scrollbars = null;

    componentDidMount() {
        const container = this.containerRef.current;

        this.scrollbars = new PerfectScrollbar(container);
    }

    componentDidUpdate() {
        if (this.scrollbars) {
            this.scrollbars.update();
        }
    }

    componentWillUnmount() {
        this.scrollbars.destroy();
        this.scrollbars = null;
    }

    render() {
        const { children, className } = this.props;

        return (
            <div className={className} ref={this.containerRef}>
                {children}
            </div>
        );
    }
}

Scrollbars.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

export default Scrollbars;
