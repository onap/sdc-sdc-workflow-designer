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

class InfiniteScroll extends React.Component {
    componentDidMount() {
        this.pageLoaded = this.props.pageStart;
        this.scrollEl = this.getScrollElement();
        this.attachScrollListener();
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    getParentElement(el) {
        return el.parentNode;
    }

    getScrollElement() {
        if (this.props.useWindow) {
            return window;
        }

        return this.getParentElement(this.scrollComponent);
    }

    detachScrollListener() {
        this.scrollEl.removeEventListener(
            'scroll',
            this.scrollListener,
            this.props.useCapture
        );
        window.removeEventListener(
            'resize',
            this.scrollListener,
            this.props.useCapture
        );
    }

    attachScrollListener() {
        if (!this.props.hasMore || !this.scrollEl) {
            return;
        }

        const options = {
            capture: this.props.useCapture,
            passive: true
        };

        this.scrollEl.addEventListener('scroll', this.scrollListener, options);
        window.addEventListener('resize', this.scrollListener, options);

        if (this.props.initialLoad) {
            this.scrollListener();
        }
    }

    scrollListener = () => {
        const el = this.scrollComponent;
        const scrollEl = window;
        const parentNode = this.getParentElement(el);

        let offset;
        if (this.props.useWindow) {
            const doc =
                document.documentElement ||
                document.body.parentNode ||
                document.body;
            const scrollTop =
                scrollEl.pageYOffset !== undefined
                    ? scrollEl.pageYOffset
                    : doc.scrollTop;

            offset =
                this.calculateTopPosition(el) +
                (el.offsetHeight - scrollTop - window.innerHeight);
        } else {
            offset =
                el.scrollHeight -
                parentNode.scrollTop -
                parentNode.clientHeight;
        }

        // Here we make sure the element is visible as well as checking the offset
        if (offset < Number(this.props.threshold) && el.offsetParent !== null) {
            this.detachScrollListener();
            // Call loadMore after detachScrollListener to allow for non-async loadMore functions
            if (typeof this.props.loadMore === 'function') {
                this.props.loadMore((this.pageLoaded += 1));
            }
        }
    };

    calculateTopPosition(el) {
        if (!el) {
            return 0;
        }
        return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }

    render() {
        const { children, element } = this.props;

        const props = {
            ref: node => {
                this.scrollComponent = node;
            }
        };

        const childrenArray = [children];

        return React.createElement(element, props, childrenArray);
    }
}

InfiniteScroll.propTypes = {
    children: PropTypes.node.isRequired,
    element: PropTypes.node,
    hasMore: PropTypes.bool,
    initialLoad: PropTypes.bool,
    loadMore: PropTypes.func.isRequired,
    pageStart: PropTypes.number,
    threshold: PropTypes.number,
    useCapture: PropTypes.bool,
    useWindow: PropTypes.bool
};

InfiniteScroll.defaultProps = {
    element: 'div',
    hasMore: false,
    initialLoad: true,
    pageStart: 0,
    threshold: 250,
    useWindow: true,
    useCapture: false
};

export default InfiniteScroll;
