import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignOutButton from '@/src/components/SignOutButton'
import { useSyncUser } from '@/src/hooks/useSyncUser'

const HomeScreen = () => {
  useSyncUser()
  return (
    <SafeAreaView className='flex-1'>
      <Text>HomeScreen</Text>
      <SignOutButton/>
    </SafeAreaView >
  )
}

export default HomeScreen

const styles = StyleSheet.create({})