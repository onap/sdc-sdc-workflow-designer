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

'use strict';

/* eslint-disable react/jsx-no-undef */

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CatalogView from '../CatalogView';

Enzyme.configure({ adapter: new Adapter() });

describe('Catalog View', () => {
    it('displays element count', () => {
        const catalogView = mount(<CatalogView />);

        expect(catalogView.find('.main__header__total').exists()).toEqual(true);
    });
});
