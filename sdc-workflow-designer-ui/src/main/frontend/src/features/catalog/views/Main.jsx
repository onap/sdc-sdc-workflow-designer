/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { I18n, Translate } from 'react-redux-i18n';
import { activateOnKey } from 'shared/a11y/activateOnKey';

import { ASC } from 'features/catalog/catalogConstants';
import { SVGIcon } from 'onap-ui-react';

class Main extends Component {
    render() {
        const {
            total,
            alphabeticalOrder,
            onAlphabeticalOrderByClick,
            children
        } = this.props;

        return (
            <div className="main">
                <div className="main__header">
                    <div className="main__header__total" role="status">
                        <Translate value="catalog.elementFound" count={total} />
                    </div>
                    <div className="main__header__order">
                        <div className="main__header__order__label">
                            <Translate value="catalog.orderBy" />:
                        </div>
                        <div
                            className="main__header__order__alphabetical"
                            data-test-id="wf-catalog-alphabetical-order"
                            role="button"
                            tabIndex={0}
                            aria-label={I18n.t(
                                alphabeticalOrder === ASC
                                    ? 'catalog.alphabeticalOrderAscending'
                                    : 'catalog.alphabeticalOrderDescending'
                            )}
                            onClick={onAlphabeticalOrderByClick}
                            onKeyDown={activateOnKey(
                                onAlphabeticalOrderByClick
                            )}>
                            <div className="main__header__order__alphabetical__label">
                                <Translate value="catalog.alphabeticalOrder" />
                            </div>
                            <div
                                className={
                                    (alphabeticalOrder === ASC &&
                                        'main__header__order__alphabetical__icon') ||
                                    'main__header__order__alphabetical__icon main__header__order__alphabetical__icon--flip'
                                }>
                                <SVGIcon name="caretDown" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        );
    }
}

Main.propTypes = {
    total: PropTypes.number,
    alphabeticalOrder: PropTypes.string,
    onAlphabeticalOrderByClick: PropTypes.func,
    handleSort: PropTypes.func,
    children: PropTypes.node
};

Main.defaultProps = {
    total: 0
};

export default Main;
