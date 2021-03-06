<template>
<div id="player-area" :class="side">

  <div id="details">
    <slot name="details">
      <player-details :player="player" :side="side"/>
    </slot>
  </div>

  <div id="score">
    <slot name="score">
      <player-score :player="player" :side="side"/>
    </slot>
  </div>

  <div id="effects">
    <slot name="effects">
      <player-effects :player="player" :side="side"/>
    </slot>
  </div>

  <div id="info" v-if="showInfoButton">
    <slot name="info">
     <player-area-info/>
    </slot>
  </div>

</div>
</template>


<script>
import PlayerDetails from '@/components/playerArea/PlayerDetails'
import PlayerScore from '@/components/playerArea/PlayerScore'
import PlayerEffects from '@/components/playerArea/PlayerEffects'
import PlayerAreaInfo from '@/components/info/PlayerAreaInfo'

/**
 * This area of the screen holds all the information about a player inlcuding
 * name and image, score, and status effects.
 *
 * ### Slots
 * - **details**
 *    + **default:** {@link PlayerDetails}
 *    + **purpose:** Holds the player's details like name and image.
 * - **score**
 *    + **default:** {@link PlayerScore}
 *    + **purpose:** Holds the player's score information.
 * - **effects**
 *    + **default:** {@link PlayerEffects}
 *    + **purpose:** Holds the players active status effects.
 * - **info**
 *    + **default:** {@link PlayerAreaInfo}
 *    + **purpose:** Holds an info popup component for this area.
 *
 * @vue-prop {Player} player - The player the details are for.
 * @vue-prop {string} side - The side of the screen it is on `left | right`.
 * @vue-computed {bool} showInfobutton - True if player is the first player, as
 * we only need to display an info button for a single player area.
 */
export default {
  name: 'player-area',
  props: ['player', 'side'],
  components: {
    'player-details': PlayerDetails,
    'player-score': PlayerScore,
    'player-effects': PlayerEffects,
    'player-area-info': PlayerAreaInfo
  },
  computed: {
    showInfoButton () {
      return this.player.id === 0
    }
  }
}
</script>

<style scoped>
#player-area {
  position: absolute;
  width: 95%;
  height: 100%;
  font-family: monospace;
}

#details {
  position: absolute;
  top: 0;
  width: 100%;
  height: 40%;
}

#score {
  position: absolute;
  top: 40%;
  width: 100%;
  height: 20%;
}

#effects {
  position: absolute;
  top: 60%;
  width: 100%;
  height: 35%;
}

#info {
  position: absolute;
  top: 10%;
  left: 35%;
}

.left {
  left: 5%;
}

.right {
  right: 5%;
}
</style>
