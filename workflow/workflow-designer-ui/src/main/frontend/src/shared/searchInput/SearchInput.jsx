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
import SVGIcon from 'sdc-ui/lib/react/SVGIcon';

class ExpandableInput extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.string
    };

    state = { showInput: false };

    handleRef = input => {
        this.domNode = input;

        this.domNode && this.domNode.focus();
    };

    showInput = () => {
        this.setState({ showInput: true });
    };

    hideInput = () => {
        this.setState({ showInput: false });
    };

    closeInput = () => {
        if (!this.props.value) {
            this.hideInput();
        }
    };

    getValue = () => {
        return this.props.value;
    };

    handleChange = e => {
        this.props.onChange(e.target.value);
    };

    handleClose() {
        this.props.onChange('');

        this.hideInput();
    }

    handleKeyDown = e => {
        if (e.key === 'Escape') {
            e.preventDefault();

            this.handleClose();
        }
    };

    handleBlur = () => {
        if (!this.props.value) {
            this.setState({ showInput: false });
        }
    };

    render() {
        let { value } = this.props;

        const { showInput } = this.state;

        if (!showInput) {
            return (
                <div className="search-input-top">
                    <SVGIcon
                        className="search-input-wrapper closed"
                        name="search"
                        onClick={this.showInput}
                    />
                </div>
            );
        }

        return (
            <div className="search-input-top">
                <div className="search-input-wrapper opened">
                    <div className="search-input-control">
                        <input
                            type="text"
                            value={value}
                            ref={this.handleRef}
                            className="input-control"
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                            onBlur={this.handleBlur}
                        />
                    </div>
                    {value && (
                        <SVGIcon
                            onClick={() => this.handleClose()}
                            name="close"
                        />
                    )}
                    {!value && (
                        <SVGIcon name="search" onClick={this.handleBlur} />
                    )}
                </div>
            </div>
        );
    }
}

export default ExpandableInput;
