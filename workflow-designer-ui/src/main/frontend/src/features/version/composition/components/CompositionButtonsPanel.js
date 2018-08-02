/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import React from 'react';
import PropTypes from 'prop-types';
import CompositionButton from './CompositionButton';

const Divider = () => <div className="divider" />;

const CompositionButtons = ({ onClean, onUpload, onDownload }) => (
    <div className="composition-buttons">
        <CompositionButton
            data-test-id="composition-clear-btn"
            onClick={onClean}
            name="trashO"
            title="clear"
        />
        <Divider />
        <CompositionButton
            data-test-id="composition-download-btn"
            onClick={onDownload}
            name="download"
            title="download"
        />
        <Divider />
        <CompositionButton
            data-test-id="composition-download-upload"
            onClick={onUpload}
            name="upload"
            title="upload"
        />
    </div>
);

CompositionButtons.propTypes = {
    onClean: PropTypes.func,
    onUpload: PropTypes.func,
    onDownload: PropTypes.func
};
export default CompositionButtons;
