// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ReactSelect from 'react-select';

import {getStyleForReactSelect} from 'utils/styles';

export default class ReactSelectSetting extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        onChange: PropTypes.func,
        theme: PropTypes.object.isRequired,
        isClearable: PropTypes.bool,
        options: PropTypes.array.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array,
        ]),
        addValidate: PropTypes.func,
        removeValidate: PropTypes.func,
        required: PropTypes.bool,
        allowUserDefinedValue: PropTypes.bool,
        limitOptions: PropTypes.bool,
        resetInvalidOnChange: PropTypes.bool,
    };

    render() {
        return (
            <ReactSelect
                {...this.props}
                menuPortalTarget={document.body}
                menuPlacement='auto'
                styles={getStyleForReactSelect(this.props.theme)}
            />
        );
    }
}
