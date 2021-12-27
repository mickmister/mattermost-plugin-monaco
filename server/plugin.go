package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost-server/v5/plugin"
)

type Plugin struct {
	plugin.MattermostPlugin

	configurationLock sync.RWMutex
	configuration     *configuration
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/preferences":
		if r.Method == http.MethodGet {
			p.handleGetPreferences(w, r)
			return
		}

		p.handleSavePreferences(w, r)
		return
	}

	fmt.Fprint(w, "Hello, world!")
}

func (p *Plugin) handleSavePreferences(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-Id")
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var preferences UserPreferences
	err := json.NewDecoder(r.Body).Decode(&preferences)
	if err != nil {
		http.Error(w, "error unmarshaling body. "+err.Error(), http.StatusBadRequest)
		return
	}

	err = p.savePreferences(userID, preferences)
	if err != nil {
		http.Error(w, "error setting theme", http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(preferences)
	if err != nil {
		http.Error(w, "failed to marshal preferences. "+err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(b)
}

func (p *Plugin) handleGetPreferences(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("Mattermost-User-Id")
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	preferences, err := p.getPreferences(userID)
	if err != nil {
		http.Error(w, "failed to get preferences. "+err.Error(), http.StatusUnauthorized)
		return
	}

	b, err := json.Marshal(preferences)
	if err != nil {
		http.Error(w, "failed to marshal preferences. "+err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(b)
}
