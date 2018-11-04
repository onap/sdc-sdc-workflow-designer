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
import InfiniteScroll from 'shared/scroll/InfiniteScroll';
import Workflows from 'features/catalog/views/Workflows';
import AddWorkflow from 'features/catalog/views/AddWorkflow';

import Header from 'features/catalog/views/Header';
import Main from 'features/catalog/views/Main';
import { NAME, ASC, DESC } from 'features/catalog/catalogConstants';

class CatalogView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { clearWorkflow } = this.props;

        clearWorkflow();
    }

    handleAlphabeticalOrderByClick = e => {
        e.preventDefault();

        const {
            handleFetchWorkflow,
            catalog: { sort, searchNameFilter }
        } = this.props;

        const payload = {
            ...sort
        };
        payload[NAME] = payload[NAME] === ASC ? DESC : ASC;
        handleFetchWorkflow(payload, undefined, searchNameFilter);
    };

    handleScroll = () => {
        const {
            catalog: {
                paging: { offset },
                sort,
                searchNameFilter
            },
            handleFetchWorkflow
        } = this.props;
        handleFetchWorkflow(sort, offset, searchNameFilter);
    };

    goToOverviewPage = id => {
        const { history } = this.props;
        history.push('/workflow/' + id + '/overview');
    };

    searchChange = searchValue => {
        this.setState({ searchValue: searchValue });
        this.dispatchChange(searchValue);
    };

    dispatchChange = searchValue => {
        const { searchInputChanged, catalog } = this.props;
        searchInputChanged({
            ...catalog,
            searchNameFilter: searchValue
        });
    };

    render() {
        const { catalog, showNewWorkflowModal } = this.props;
        const {
            sort,
            paging: { hasMore, total },
            items,
            searchNameFilter
        } = catalog;
        const alphabeticalOrder = sort[NAME];

        return (
            <div className="wf-catalog">
                <Header
                    searchChange={this.searchChange}
                    searchValue={searchNameFilter}
                />
                <InfiniteScroll
                    useWindow={false}
                    loadMore={this.handleScroll}
                    hasMore={hasMore}>
                    <Main
                        total={total}
                        alphabeticalOrder={alphabeticalOrder}
                        onAlphabeticalOrderByClick={
                            this.handleAlphabeticalOrderByClick
                        }>
                        <div className="main__content">
                            <AddWorkflow onClick={showNewWorkflowModal} />
                            <Workflows
                                items={items}
                                onWorkflowClick={this.goToOverviewPage}
                            />
                        </div>
                    </Main>
                </InfiniteScroll>
            </div>
        );
    }
}

CatalogView.propTypes = {
    history: PropTypes.object,
    catalog: PropTypes.object,
    handleResetWorkflow: PropTypes.func,
    handleFetchWorkflow: PropTypes.func,
    showNewWorkflowModal: PropTypes.func,
    clearWorkflow: PropTypes.func,
    searchInputChanged: PropTypes.func,
    searchNameFilter: PropTypes.string
};

CatalogView.defaultProps = {
    showNewWorkflowModal: () => {},
    clearWorkflow: () => {}
};

export default CatalogView;
