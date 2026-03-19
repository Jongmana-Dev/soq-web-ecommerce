'use client'

import { useState, useEffect, useMemo } from 'react'

// --- Types ---

interface SubdistrictRaw {
  subdistrict: string
  zipcode: string
}

interface DistrictRaw {
  district: string
  subdistricts: SubdistrictRaw[]
}

interface ProvinceRaw {
  province: string
  districts: DistrictRaw[]
}

export type ThaiGeoData = ProvinceRaw[]

export interface SelectOption {
  value: string
  label: string
}

export interface SubdistrictOption extends SelectOption {
  zipcode: string
}

// --- Module-level cache ---

let cachedData: ThaiGeoData | null = null
let fetchPromise: Promise<ThaiGeoData> | null = null

async function fetchGeoData(): Promise<ThaiGeoData> {
  if (cachedData) return cachedData
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/data/thai-geography.json')
    .then((res) => res.json())
    .then((json: ThaiGeoData) => {
      cachedData = json
      return json
    })
    .catch((err) => {
      fetchPromise = null
      throw err
    })

  return fetchPromise
}

// --- Hooks ---

export function useThaiGeography() {
  const [data, setData] = useState<ThaiGeoData | null>(cachedData)
  const [loading, setLoading] = useState(!cachedData)

  useEffect(() => {
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
      return
    }

    fetchGeoData()
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useGeoSelections(
  data: ThaiGeoData | null,
  selectedProvince: string,
  selectedDistrict: string,
  _locale?: string,
) {
  const provinces = useMemo<SelectOption[]>(() => {
    if (!data) return []
    return data.map((p) => ({ value: p.province, label: p.province }))
  }, [data])

  const districts = useMemo<SelectOption[]>(() => {
    if (!data || !selectedProvince) return []
    const prov = data.find((p) => p.province === selectedProvince)
    if (!prov) return []
    return prov.districts.map((d) => ({ value: d.district, label: d.district }))
  }, [data, selectedProvince])

  const subdistricts = useMemo<SubdistrictOption[]>(() => {
    if (!data || !selectedProvince || !selectedDistrict) return []
    const prov = data.find((p) => p.province === selectedProvince)
    if (!prov) return []
    const dist = prov.districts.find((d) => d.district === selectedDistrict)
    if (!dist) return []
    // Check which subdistrict names appear more than once (different zipcodes)
    const nameCount = new Map<string, number>()
    dist.subdistricts.forEach((s) => nameCount.set(s.subdistrict, (nameCount.get(s.subdistrict) ?? 0) + 1))

    return dist.subdistricts.map((s) => {
      const isDuplicate = (nameCount.get(s.subdistrict) ?? 0) > 1
      return {
        value: isDuplicate ? `${s.subdistrict}||${s.zipcode}` : s.subdistrict,
        label: isDuplicate ? `${s.subdistrict} (${s.zipcode})` : s.subdistrict,
        zipcode: s.zipcode,
      }
    })
  }, [data, selectedProvince, selectedDistrict])

  return { provinces, districts, subdistricts }
}
