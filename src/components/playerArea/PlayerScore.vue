<template>
<div id="player-score" :style="{ 'text-align': side }">

    <h5 class="score-title">
      <b>Score:</b> <b>{{ game.getPlayerScore(player.id) }}/{{ game.scoreLimit }}</b>
    </h5>

    <meter class="score-meter"
       :max="game.scoreLimit" min=0
       :value="game.getPlayerScore(player.id)"
       :high="game.scoreLimit * 0.75"
       :low="game.scoreLimit * 0.50"
       :optimum="game.scoreLimit">
    </meter>

</div>
</template>

<script>
import { mapGetters } from 'vuex'

/**
 * Displays the players score along with a meter indicating how far the score is
 * from the game's score limit.
 * @vue-prop {Player} player - The player the details are for.
 * @vue-prop {string} side - The side of the screen it is on `left | right`.
 */
export default {
  name: 'player-score',
  props: ['player', 'side'],
  computed: {
    ...mapGetters(['game']),
  }
}
</script>

<style scoped>
#player-score {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.score-title {
  margin: 0;
  margin-top: 1rem;
}

.score-meter {
  width: 80%;
  height: 1rem;
}

.score-meter::-webkit-meter-bar {
  position: relative;
  top: -0.2rem;
  height: 1rem;
  border: 0;
}
</style>
