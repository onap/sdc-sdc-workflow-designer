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

import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalFooter
} from 'sdc-ui/lib/react';

import modalWrapperComponents from './modalWrapperComponents';

class ModalWrapperView extends React.Component {
    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        const { hideModal, onClose } = this.props;

        hideModal();

        if (typeof onClose === 'function') {
            onClose();
        }
    }

    render() {
        const { modal } = this.props;

        if (!modal || !modal.type) {
            return null;
        }

        const {
            size,
            type,
            title,
            body,
            withButtons,
            actionButtonText,
            actionButtonClick,
            closeButtonText,
            customComponentName,
            customComponentProps
        } = modal;

        const CustomComponent =
            customComponentName && modalWrapperComponents[customComponentName];

        return (
            <Modal show size={size} type={type}>
                <ModalHeader onClose={this.handleClose} type={type}>
                    {title && <ModalTitle>{title}</ModalTitle>}
                </ModalHeader>
                {body && <ModalBody>{body}</ModalBody>}
                {CustomComponent && (
                    <CustomComponent {...customComponentProps} />
                )}
                {withButtons && (
                    <ModalFooter
                        actionButtonText={actionButtonText}
                        actionButtonClick={actionButtonClick}
                        closeButtonText={closeButtonText}
                        onClose={this.handleClose}
                        withButtons
                    />
                )}
            </Modal>
        );
    }
}

ModalWrapperView.propTypes = {
    hideModal: PropTypes.func,
    onClose: PropTypes.func,
    modal: PropTypes.object
};

export default ModalWrapperView;
