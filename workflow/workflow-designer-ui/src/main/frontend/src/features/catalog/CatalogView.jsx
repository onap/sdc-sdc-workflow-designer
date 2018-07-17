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

import Header from './views/Header';
import Main from './views/Main';

class CatalogView extends React.Component {
    componentDidMount() {
        const { clearWorkflow } = this.props;

        clearWorkflow();
    }

    goToOverviewPage = id => {
        const { history } = this.props;
        history.push('/workflow/' + id + '/overview');
    };

    render() {
        const {
            workflows,
            sort,
            handleSort,
            handleScroll,
            showNewWorkflowModal
        } = this.props;

        return (
            <div className="wf-catalog">
                <Header />
                <Main
                    sort={sort}
                    workflows={workflows}
                    handleSort={handleSort}
                    handleScroll={handleScroll}
                    showNewWorkflowModal={showNewWorkflowModal}
                    onWorkflowClick={this.goToOverviewPage}
                />
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
