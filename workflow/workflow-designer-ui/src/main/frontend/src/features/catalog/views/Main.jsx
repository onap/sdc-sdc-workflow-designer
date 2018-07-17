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
import { Translate } from 'react-redux-i18n';
import InfiniteScroll from 'react-infinite-scroller';

import SVGIcon from 'sdc-ui/lib/react/SVGIcon';

import { NAME, ASC, DESC } from '../catalogReducer';
import Workflows from './Workflows';
import AddWorkflow from './AddWorkflow';

class Main extends Component {
    handleAlphabeticalOrderByClick = e => {
        e.preventDefault();

        const { handleSort, sort } = this.props;

        const payload = {
            [NAME]: sort[NAME] === ASC ? DESC : ASC
        };

        handleSort(payload);
    };

    render() {
        const {
            sort: { [NAME]: alphabeticalOrder },
            workflows,
            handleScroll,
            showNewWorkflowModal,
            onWorkflowClick
        } = this.props;

        const { total, results = [], limit, offset } = workflows;

        const hasMore = total === 0 || limit * (offset + 1) < total;

        return (
            <div className="main">
                <div className="main__header">
                    <div className="main__header__total">
                        <Translate value="catalog.elementFound" count={total} />
                    </div>
                    <div className="main__header__order">
                        <div className="main__header__order__label">
                            <Translate value="catalog.orderBy" />:
                        </div>
                        <div
                            className="main__header__order__alphabetical"
                            onClick={this.handleAlphabeticalOrderByClick}>
                            <div className="main__header__order__alphabetical__label">
                                <Translate value="catalog.alphabeticalOrder" />
                            </div>
                            <div
                                className={
                                    (alphabeticalOrder === ASC &&
                                        'main__header__order__alphabetical__icon') ||
                                    'main__header__order__alphabetical__icon main__header__order__alphabetical__icon--flip'
                                }>
                                <SVGIcon name="caretDown" />
                            </div>
                        </div>
                    </div>
                </div>
                <InfiniteScroll
                    pageStart={0}
                    loadMore={handleScroll}
                    hasMore={hasMore}>
                    <div className="main__content">
                        <AddWorkflow onClick={showNewWorkflowModal} />
                        <Workflows
                            workflows={results}
                            onWorkflowClick={onWorkflowClick}
                        />
                    </div>
                </InfiniteScroll>
            </div>
        );
    }
}

Main.propTypes = {
    workflows: PropTypes.object,
    sort: PropTypes.object,
    handleSort: PropTypes.func,
    handleScroll: PropTypes.func,
    showNewWorkflowModal: PropTypes.func,
    onWorkflowClick: PropTypes.func
};

export default Main;
