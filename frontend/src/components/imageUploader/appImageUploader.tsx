import React from 'react'
import ImageUploader from './imageUploader'
import { Controller, Control } from 'react-hook-form'
import { RNfile } from '../../api/image.api'

interface AppImageUploaderProps {
    name: string;
    control: Control<any>;
    style?: any;

    imageUrl?: string | null;
}

export const AppImageUploader: React.FC<AppImageUploaderProps> = ({ name, control, style, imageUrl}) => {
    return (
        <Controller 
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <ImageUploader
                    name={name}
                    /**
                     * Ảnh hiển thị:
                     * - Nếu user đẫ chọn ảnh mới -> value
                     * - Nếu chưa -> imageUrl (ảnh cũ)
                     */
                    value={value ?? null}
                    imageUrl={imageUrl ?? null}
                    /**
                     * Khi user chọn ảnh
                     * -> ghi RNfile vào form
                     */
                    onChange={(file: RNfile | null) => {
                        onChange(file ?? undefined);
                    }}
                    style={style}
                />
            )}
        />
    )
}

export default AppImageUploader