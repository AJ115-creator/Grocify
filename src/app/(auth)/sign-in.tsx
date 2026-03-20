import { AuthView } from '@clerk/expo/native'
import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import useSocialAuth from '../hooks/useSocialAuth'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import CustomAlert from '@/components/CustomAlert'

export default function SignInScreen() {
    const { handleSocialAuth, loadingStrategy, alertConfig, closeAlert } = useSocialAuth()
    const isGoogleClicked = loadingStrategy === 'oauth_google'
    const isAppleClicked = loadingStrategy === 'oauth_apple'
    const isGithubClicked = loadingStrategy === 'oauth_github'

    const isLoading = isAppleClicked || isGoogleClicked || isGithubClicked;

    return (
        <SafeAreaView className='flex-1 bg-primary dark:bg-secondary' edges={['top']}>
            <View className='absolute -left-16 top-12 h-56 w-56 rounded-full bg-secondary/50 dark:bg-background/80' />
            <View className='absolute right-[-74px] top-40 h-72 w-72 rounded-full bg-secondary/50 dark:bg-background/35' />
            <View className='px-6 pt-4' >
                <Text className='text-center text-5xl font-extrabold tracking-tight text-primary-foreground uppercase font-mono dark: text-white'>
                    Grocify
                </Text>
                <Text className='mt-1 text-center text-[14px] text-primary-foreground/80 dark:text-foreground/75' >
                    Plan Smarter. Shop Happier.
                </Text>
                <View className='mt-6 rounded-[30px] border border-white/20 bg-white/10 p-3'>
                    <Image
                        source={require("../../../assets/images/auth.png")}
                        style={{ width: "100%", height: 300 }}
                        contentFit="contain"
                    />
                </View>
            </View>
            <View className='mt-8 flex-1 rounded-t-[36px] bg-card px-6 pb-8 pt-6'>
                <View className='self-center rounded-full bg-secondary px-3 py-1'>
                    <Text className='text-xs font-semibold uppercase tracking-[1px] text-secondary-foreground'>
                        Welcome Back
                    </Text>
                </View>
                <Text className='mt-2 text-center text-sm leading-6 text-secondary-foreground font-normal'>
                    Choose a social provider and jump right into your personalized grocery experience.
                </Text>
                <View className='mt-6'>
                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-border dark:border-white bg-card px-4 active:opacity-90
                            ${isLoading ? "opacity-70" : ""}`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_google")}>
                        <View className='h-8 w-8 items-center justify-center rounded-full bg-white'>
                            <Image
                                source={require("../../../assets/images/google.png")}
                                style={{ width: 20, height: 20 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text className='ml-3 flex-1 text-lg font-semibold text-card-foreground dark:text-white'>
                            {isGoogleClicked ? "Connecting Google" : "Continue with Google"}
                        </Text>
                        <FontAwesome name='angle-right' size={18} color="#5f6e66" />
                    </Pressable>
                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-border dark:border-white bg-card px-4 active:opacity-90
                            ${isLoading ? "opacity-70" : ""}`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_apple")}>
                        <View className='h-8 w-8 items-center justify-center rounded-full bg-white'>
                            <Image
                                source={require("../../../assets/images/apple-logo.png")}
                                style={{ width: 20, height: 20 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text className='ml-3 flex-1 text-lg font-semibold text-card-foreground dark:text-white'>
                            {isAppleClicked ? "Connecting to Apple..." : "Continue with Apple"}
                        </Text>
                        <FontAwesome name='angle-right' size={18} color="#5f6e66" />
                    </Pressable>
                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-border dark:border-white bg-card px-4 active:opacity-90
                            ${isLoading ? "opacity-70" : ""}`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_google")}>
                        <View className='h-8 w-8 items-center justify-center rounded-full bg-white'>
                            <Image
                                source={require("../../../assets/images/github.jpg")}
                                style={{ width: 20, height: 20 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text className='ml-3 flex-1 text-lg font-semibold text-card-foreground dark:text-white'>
                            {isGithubClicked ? "Connecting to GitHub..." : "Continue with GitHub"}
                        </Text>
                        <FontAwesome name='angle-right' size={18} color="#5f6e66" />
                    </Pressable>
                </View>
                <Text className='mt-2 text-center text-sm leading-6 text-secondary-foreground font-normal'>
                    By continuing, you agree to our Terms and Privacy Policy
                </Text>
            </View>
            <CustomAlert 
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />
        </SafeAreaView>
    );
}