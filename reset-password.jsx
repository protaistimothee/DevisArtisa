// app/reset-password.jsx
import { useAuth } from '@/context/AuthContext'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase envoie le token via le deep link — onAuthStateChange le capte automatiquement
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (!password || !confirm) {
      Toast.show({ type: 'error', text1: 'Remplis tous les champs.' })
      return
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Le mot de passe doit faire au moins 6 caractères.' })
      return
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Les mots de passe ne correspondent pas.' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      Toast.show({ type: 'success', text1: 'Mot de passe mis à jour !', text2: 'Tu peux te connecter.' })
      router.replace('/login')
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.message ?? 'Erreur lors de la mise à jour.' })
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <Text style={styles.title}>⏳</Text>
        <Text style={styles.subtitle}>Vérification du lien en cours...</Text>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <Text style={styles.subtitle}>Choisis un nouveau mot de passe pour ton compte.</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nouveau mot de passe"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#999"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showConfirm}
        />
        <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.btn} onPress={handleReset} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Mise à jour...' : 'Mettre à jour'}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  btn: {
    backgroundColor: '#2563eb', borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 16
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
})
