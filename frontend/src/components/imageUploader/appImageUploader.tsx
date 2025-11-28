import React from 'react'
import ImageUploader from './imageUploader'
import { Controller, Control } from 'react-hook-form'
import { RNfile } from '../../api/image.api'

interface AppImageUploaderProps {
    name: string;
    control: Control<any>;
    style?: any;
}

export const AppImageUploader: React.FC<AppImageUploaderProps> = ({ name, control, style}) => {
    return (
        <Controller 
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <ImageUploader
                    name={name}
                    value={value || null}
                    style={style}
                    onChange={onChange}
                />
            )}
        />
    )
}

export default AppImageUploader