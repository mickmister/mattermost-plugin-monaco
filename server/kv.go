package main

import (
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"
)

type UserPreferences struct {
	Theme string `json:"theme"`
}

func (p *Plugin) savePreferences(userID string, preferences UserPreferences) error {
	key := fmt.Sprintf("%s-%s", userID, "preferences")

	b, err := json.Marshal(preferences)
	if err != nil {
		return errors.Wrap(err, "failed to marshal preferences")
	}

	appErr := p.API.KVSet(key, b)
	if appErr != nil {
		return errors.Wrap(appErr, "failed to save preferences in kv store")
	}

	return nil
}

func (p *Plugin) getPreferences(userID string) (*UserPreferences, error) {
	key := fmt.Sprintf("%s-%s", userID, "preferences")

	b, appErr := p.API.KVGet(key)
	if appErr != nil {
		return nil, errors.Wrap(appErr, "failed to get preferences from kv store")
	}

	preferences := &UserPreferences{
		Theme: "vs-dark",
	}
	if len(b) == 0 {
		return preferences, nil
	}

	err := json.Unmarshal(b, preferences)
	if err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal preferences")
	}

	return preferences, nil
}
