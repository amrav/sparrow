package proto

import (
	"fmt"
	"math/rand"
	"strings"
)

func LockToKey(lock string) string {
	lockBytes := []byte(lock)
	key := make([]byte, len(lock))
	for i := 1; i < len(lock); i += 1 {
		key[i] = lockBytes[i] ^ lockBytes[i-1]
	}
	key[0] = lockBytes[0] ^ lockBytes[len(lock)-1] ^ lockBytes[len(lock)-2] ^ 5
	for i := range key {
		key[i] = ((key[i] << 4) | (key[i] >> 4)) & 0xFF
	}
	var result []byte
	for _, k := range key {
		switch k {
		case 0, 5, 36, 96, 124, 126:
			result = append(result, fmt.Sprintf("/%%DCN%03d%%/", k)...)
		default:
			result = append(result, k)
		}
	}
	return string(result)
}

func GenerateRandomUsername() string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, 16)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func Escape(str string) string {
	str = strings.Replace(str, "$", "&#36;", -1)
	str = strings.Replace(str, "|", "&#124;", -1)
	str = strings.Replace(str, "&", "&amp;", -1)
	return str
}
