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

import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroller';
import Workflows from 'features/catalog/views/Workflows';
import AddWorkflow from 'features/catalog/views/AddWorkflow';

import Header from 'features/catalog/views/Header';
import Main from 'features/catalog/views/Main';

import { NAME, ASC, DESC } from 'features/catalog/catalogConstants';

class CatalogView extends React.Component {
    componentDidMount() {
        const { clearWorkflow } = this.props;

        clearWorkflow();
    }

    handleAlphabeticalOrderByClick = e => {
        e.preventDefault();

        const { handleSort, sort } = this.props;

        const payload = { ...sort };

        payload[NAME] = payload[NAME] === ASC ? DESC : ASC;

        handleSort(payload);
    };

    handleScroll = () => {
        const { workflows, sort, handleScroll } = this.props;
        const { page } = workflows;

        handleScroll(page, sort);
    };

    goToOverviewPage = id => {
        const { history } = this.props;
        history.push('/workflow/' + id + '/overview');
    };

    render() {
        const { workflows, sort, showNewWorkflowModal } = this.props;

        const alphabeticalOrder = sort[NAME];
        // TODO remove offset, fix hasMore, use size
        const { total, results = [], /*size,*/ page, offset } = workflows;

        // const hasMore = total === 0 || size * (page + 1) < total;
        const hasMore = offset !== undefined ? offset < 0 : page < 0;

        return (
            <div className="wf-catalog">
                <Header />
                <Main
                    total={total}
                    alphabeticalOrder={alphabeticalOrder}
                    onAlphabeticalOrderByClick={
                        this.handleAlphabeticalOrderByClick
                    }>
                    <InfiniteScroll
                        loadMore={this.handleScroll}
                        hasMore={hasMore}>
                        <div className="main__content">
                            <AddWorkflow onClick={showNewWorkflowModal} />
                            <Workflows
                                workflows={results}
                                onWorkflowClick={this.goToOverviewPage}
                            />
                        </div>
                    </InfiniteScroll>
                </Main>
            </div>
        );
    }
}

CatalogView.propTypes = {
    history: PropTypes.object,
    workflows: PropTypes.object,
    sort: PropTypes.object,
    handleScroll: PropTypes.func,
    handleSort: PropTypes.func,
    showNewWorkflowModal: PropTypes.func,
    clearWorkflow: PropTypes.func
};

CatalogView.defaultProps = {
    workflows: {},
    sort: {},
    handleScroll: () => {},
    showNewWorkflowModal: () => {},
    clearWorkflow: () => {}
};

export default CatalogView;
