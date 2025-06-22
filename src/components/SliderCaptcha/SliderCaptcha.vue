<template>
  <div class="slider-captcha-modal" v-show="visible" @click.self="close">
    <div class="captcha-container">
      <div class="captcha-header">
        <span class="header-title">安全验证</span>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="captcha-content">
        <div class="image-container" ref="imageContainer">
          <canvas
            ref="backgroundCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            class="background-canvas"
          ></canvas>
          <canvas
            ref="puzzleCanvas"
            :width="puzzleSize"
            :height="puzzleSize"
            class="puzzle-canvas"
            :style="{ left: puzzleX + 'px', top: puzzleY + 'px' }"
          ></canvas>
        </div>
        
        <div class="slider-container">
          <div class="slider-track">
            <div 
              class="slider-fill"
              :style="{ width: sliderProgress + '%' }"
            ></div>
                          <div
                class="slider-button"
                :class="{ 'dragging': isDragging }"
                :style="{ left: sliderPosition + 'px' }"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <div class="pause-icon">
                  <span class="pause-bar"></span>
                  <span class="pause-bar"></span>
                </div>
              </div>
          </div>
          <div class="slider-text">{{ sliderText }}</div>
        </div>
        
        <div class="captcha-footer">
          <button class="refresh-btn" @click="refresh">
            <i class="refresh-icon">⟲</i>
            刷新
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, toRefs, watch } from 'vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'fail'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Canvas 相关
const backgroundCanvas = ref<HTMLCanvasElement>()
const puzzleCanvas = ref<HTMLCanvasElement>()
const imageContainer = ref<HTMLDivElement>()

// 画布尺寸
const canvasWidth = 320
const canvasHeight = 180
const puzzleSize = 50

// 拼图位置
const puzzleX = ref(0)
const puzzleY = ref(0)
const correctX = ref(0)

// 滑块相关
const sliderPosition = ref(0)
const sliderProgress = ref(0)
const sliderText = ref('向右滑动完成验证')
const isDragging = ref(false)
const startX = ref(0)

// 验证状态
const isVerifying = ref(false)
const verifySuccess = ref(false)

// 生成夕阳海景背景
const generateBackground = (ctx: CanvasRenderingContext2D) => {
  // 创建夕阳渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, '#FFB366') // 橙色天空
  gradient.addColorStop(0.4, '#FF6B9D') // 粉红色
  gradient.addColorStop(0.7, '#4ECDC4') // 青色海水
  gradient.addColorStop(1, '#2B4A87') // 深蓝海底
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // 添加太阳
  const sunGradient = ctx.createRadialGradient(240, 60, 0, 240, 60, 30)
  sunGradient.addColorStop(0, '#FFE066')
  sunGradient.addColorStop(1, '#FF8C42')
  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(240, 60, 25, 0, Math.PI * 2)
  ctx.fill()
  
  // 添加云朵
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  const drawCloud = (x: number, y: number, scale: number = 1) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    ctx.beginPath()
    ctx.arc(0, 0, 10, 0, Math.PI * 2)
    ctx.arc(15, 0, 12, 0, Math.PI * 2)
    ctx.arc(25, 0, 10, 0, Math.PI * 2)
    ctx.arc(12, -8, 8, 0, Math.PI * 2)
    ctx.arc(20, -8, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  
  drawCloud(50, 40, 0.8)
  drawCloud(150, 30, 0.6)
  drawCloud(270, 45, 0.7)
  drawCloud(300, 35, 0.5)
  
  // 添加飞鸟
  ctx.strokeStyle = '#2B4A87'
  ctx.lineWidth = 2
  const drawBird = (x: number, y: number, size: number = 1) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size, size)
    ctx.beginPath()
    ctx.moveTo(-5, 0)
    ctx.quadraticCurveTo(0, -3, 5, 0)
    ctx.moveTo(-5, 0)
    ctx.quadraticCurveTo(0, 3, 5, 0)
    ctx.stroke()
    ctx.restore()
  }
  
  // 绘制多只飞鸟
  drawBird(80, 70, 0.8)
  drawBird(95, 65, 0.6)
  drawBird(110, 68, 0.7)
  drawBird(160, 80, 0.5)
  drawBird(175, 75, 0.6)
  drawBird(190, 78, 0.4)
  drawBird(200, 85, 0.5)
  drawBird(40, 90, 0.7)
  drawBird(55, 95, 0.5)
  
  // 添加海面波纹
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    const y = 140 + i * 8
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < canvasWidth; x += 20) {
      ctx.quadraticCurveTo(x + 10, y - 3, x + 20, y)
    }
    ctx.stroke()
  }
}

// 生成拼图形状路径
const createPuzzlePath = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const path = new Path2D()
  const radius = size * 0.15
  
  // 创建带有凸起的拼图形状
  path.moveTo(x, y)
  path.lineTo(x + size * 0.3, y)
  
  // 上边凸起
  path.arc(x + size * 0.5, y, radius, Math.PI, 0, false)
  
  path.lineTo(x + size, y)
  path.lineTo(x + size, y + size * 0.3)
  
  // 右边凸起
  path.arc(x + size, y + size * 0.5, radius, Math.PI * 1.5, Math.PI * 0.5, false)
  
  path.lineTo(x + size, y + size)
  path.lineTo(x + size * 0.7, y + size)
  
  // 下边凹陷
  path.arc(x + size * 0.5, y + size, radius, 0, Math.PI, true)
  
  path.lineTo(x, y + size)
  path.lineTo(x, y + size * 0.7)
  
  // 左边凹陷
  path.arc(x, y + size * 0.5, radius, Math.PI * 0.5, Math.PI * 1.5, true)
  
  path.closePath()
  
  return path
}

// 初始化验证码
const initCaptcha = () => {
  if (!backgroundCanvas.value || !puzzleCanvas.value) return
  
  const bgCtx = backgroundCanvas.value.getContext('2d')!
  const puzzleCtx = puzzleCanvas.value.getContext('2d')!
  
  // 生成随机拼图位置
  correctX.value = Math.random() * (canvasWidth - puzzleSize - 50) + 50
  puzzleY.value = Math.random() * (canvasHeight - puzzleSize - 20) + 10
  puzzleX.value = 0
  
  // 清空画布
  bgCtx.clearRect(0, 0, canvasWidth, canvasHeight)
  puzzleCtx.clearRect(0, 0, puzzleSize, puzzleSize)
  
  // 生成背景
  generateBackground(bgCtx)
  
  // 创建拼图路径
  const puzzlePath = createPuzzlePath(bgCtx, correctX.value, puzzleY.value, puzzleSize)
  
  // 在背景上挖空
  bgCtx.save()
  bgCtx.globalCompositeOperation = 'destination-out'
  bgCtx.fill(puzzlePath)
  bgCtx.restore()
  
  // 添加拼图边框和阴影
  bgCtx.save()
  bgCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  bgCtx.shadowBlur = 10
  bgCtx.shadowOffsetX = 2
  bgCtx.shadowOffsetY = 2
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  bgCtx.lineWidth = 2
  bgCtx.stroke(puzzlePath)
  bgCtx.restore()
  
  // 绘制拼图块
  // 先创建一个临时画布来绘制完整背景
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvasWidth
  tempCanvas.height = canvasHeight
  const tempCtx = tempCanvas.getContext('2d')!
  generateBackground(tempCtx)
  
  // 绘制拼图内容
  puzzleCtx.drawImage(tempCanvas, -correctX.value, -puzzleY.value)
  
  // 裁剪拼图形状
  const puzzlePathForPiece = createPuzzlePath(puzzleCtx, 0, 0, puzzleSize)
  puzzleCtx.save()
  puzzleCtx.globalCompositeOperation = 'destination-in'
  puzzleCtx.fill(puzzlePathForPiece)
  puzzleCtx.restore()
  
  // 添加拼图边框和阴影
  puzzleCtx.save()
  puzzleCtx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  puzzleCtx.shadowBlur = 5
  puzzleCtx.shadowOffsetX = 1
  puzzleCtx.shadowOffsetY = 1
  puzzleCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  puzzleCtx.lineWidth = 2
  puzzleCtx.stroke(puzzlePathForPiece)
  puzzleCtx.restore()
  
  // 重置滑块
  sliderPosition.value = 0
  sliderProgress.value = 0
  sliderText.value = '向右滑动完成验证'
  verifySuccess.value = false
}

// 开始拖拽
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (verifySuccess.value) return
  
  isDragging.value = true
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  startX.value = clientX - sliderPosition.value
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
  
  e.preventDefault()
}

// 拖拽中
const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const maxWidth = 250 // 滑块轨道宽度 - 滑块宽度
  let newPosition = clientX - startX.value
  
  newPosition = Math.max(0, Math.min(newPosition, maxWidth))
  sliderPosition.value = newPosition
  sliderProgress.value = (newPosition / maxWidth) * 100
  
  // 移动拼图
  puzzleX.value = (newPosition / maxWidth) * (canvasWidth - puzzleSize)
  
  e.preventDefault()
}

// 停止拖拽
const stopDrag = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  
  // 验证位置
  verify()
}

// 验证拼图位置
const verify = () => {
  const tolerance = 10 // 容差范围
  const distance = Math.abs(puzzleX.value - correctX.value)
  
  if (distance <= tolerance) {
    // 验证成功
    verifySuccess.value = true
    sliderText.value = '验证成功'
    sliderProgress.value = 100
    
    setTimeout(() => {
      emit('success')
      close()
    }, 800)
  } else {
    // 验证失败
    sliderText.value = '验证失败，请重试'
    
    setTimeout(() => {
      // 重置位置
      sliderPosition.value = 0
      sliderProgress.value = 0
      puzzleX.value = 0
      sliderText.value = '向右滑动完成验证'
      emit('fail')
    }, 1000)
  }
}

// 刷新验证码
const refresh = () => {
  initCaptcha()
}

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}

// 监听显示状态
const handleVisibleChange = () => {
  if (props.visible) {
    nextTick(() => {
      initCaptcha()
    })
  }
}

// 组件挂载时初始化
onMounted(() => {
  if (props.visible) {
    handleVisibleChange()
  }
})

// 监听 visible 变化
const { visible } = toRefs(props)
watch(visible, handleVisibleChange)
</script>

<style scoped>
.slider-captcha-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.captcha-container {
  background: white;
  border-radius: 8px;
  width: 360px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.captcha-content {
  padding: 20px;
}

.image-container {
  position: relative;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.background-canvas {
  display: block;
  width: 100%;
  height: auto;
  max-width: 320px;
}

.puzzle-canvas {
  position: absolute;
  top: 0;
  cursor: move;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.slider-container {
  position: relative;
  margin-bottom: 16px;
}

.slider-track {
  position: relative;
  height: 40px;
  background: #f0f0f0;
  border-radius: 20px;
  border: 1px solid #ddd;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 20px;
  transition: width 0.3s ease;
}

.slider-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 18px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.slider-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider-button:active,
.slider-button.dragging {
  cursor: grabbing;
}

.pause-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.pause-bar {
  width: 3px;
  height: 12px;
  background: #666;
  border-radius: 1px;
}

.slider-text {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.captcha-footer {
  display: flex;
  justify-content: center;
}

.refresh-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.refresh-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.refresh-icon {
  font-size: 16px;
  font-style: normal;
}
</style> 