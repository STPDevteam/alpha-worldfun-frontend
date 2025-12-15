'use client';

import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { useCallback } from 'react';

import { useResponsive } from '@/hooks/use-responsive';
import { getDefaultTokenBanner } from '@/libs/constants';
import { TokenType } from '@/libs/types';

import { Button } from '../../ui';
import type { EnterWorldSectionProps } from './types';

const DEFAULT_BANNER_URL = getDefaultTokenBanner(TokenType.WORLD_IDEA_TOKEN);

const getButtonStyles = () => ({
    fontFamily: 'DM Mono',
    fontWeight: 400,
    lineHeight: '1.1111111111111112em',
});

export const EnterWorldSection = ({
    onEnterWorld,
    bannerUrl,
    className,
    tokenType,
}: EnterWorldSectionProps) => {
    const { isMobile } = useResponsive();
    const fallbackBannerUrl = tokenType
        ? getDefaultTokenBanner(tokenType)
        : DEFAULT_BANNER_URL;
    const resolvedBannerUrl = bannerUrl ?? fallbackBannerUrl;

    const handleEnterWorld = useCallback(() => {
        if (onEnterWorld) {
            onEnterWorld();
            return;
        }

        window.open('https://sim.tradeclash.xyz/', '_blank', 'noopener,noreferrer');
    }, [onEnterWorld]);

    return (
        <div className={`w-full xl:max-w-[445px] mx-auto not-md:px-4 md:shadow-none ${className || ''}`}>
            <AspectRatio ratio={445 / 309}>
                <div
                    className="relative flex items-center justify-center w-full h-full border border-[#171717] rounded-2xl overflow-hidden"
                    style={{
                        backgroundImage: `url('${resolvedBannerUrl}')`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        boxShadow: isMobile ? '2px 2px 8px 8px #3E8FCC47' : 'none',
                    }}
                >
                    {/* <Button
                        variant="destructive"
                        onClick={handleEnterWorld}
                        className="relative w-[70%] max-w-[285px] min-h-[60px] md:min-h-[71px] px-4 py-3 bg-[rgba(23,23,23,0.88)] text-[#8C8C8C] hover:bg-[rgba(23,23,23,1)] text-[16px] md:text-[18px] transition-colors rounded-[5px] flex items-center justify-center"
                        style={getButtonStyles()}
                    >
                        Enter World
                    </Button> */}
                </div>
            </AspectRatio>
        </div>
    );
};
